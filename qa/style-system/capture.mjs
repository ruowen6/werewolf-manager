/* global URL, WebSocket, console, fetch, process, setTimeout */

import { writeFile } from 'node:fs/promises';

const appOrigin = process.argv[2] ?? 'http://127.0.0.1:5173';

const targets = await fetch('http://127.0.0.1:9222/json/list').then(
  (response) => response.json(),
);
const target = targets.find((candidate) => candidate.type === 'page');

if (!target) throw new Error('No Chrome page target found.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const browserErrors = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  const handler = pending.get(message.id);
  if (handler) {
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
    return;
  }

  if (message.method === 'Runtime.exceptionThrown') {
    browserErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    browserErrors.push(message.params.entry.text);
  }
});

function send(method, params = {}) {
  const id = ++commandId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function viewport(width, height, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await sleep(200);
}

async function navigate(path, width, height) {
  await viewport(width, height);
  await send('Page.navigate', { url: `${appOrigin}/#${path}` });
  await sleep(900);
  await evaluate("scrollTo({ top: 0, behavior: 'instant' })");
}

async function screenshot(filename) {
  await evaluate(`(() => {
    document.getAnimations().forEach((animation) => {
      try {
        animation.finish();
      } catch {
        // Infinite decorative animations can remain in motion.
      }
    });
  })()`);
  await sleep(60);
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  await writeFile(new URL(filename, import.meta.url), result.data, 'base64');
}

async function clickText(text) {
  const clicked = await evaluate(`(() => {
    const element = [...document.querySelectorAll('button, a')]
      .find((candidate) => candidate.offsetParent !== null && candidate.textContent.includes(${JSON.stringify(text)}));
    if (!element) return false;
    element.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Text control not found: ${text}`);
  await sleep(650);
}

async function setInput(selector, value) {
  const changed = await evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    ).set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  if (!changed) throw new Error(`Input not found: ${selector}`);
  await sleep(100);
}

async function waitForVisibleText(text, timeout = 10_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const found = await evaluate(`(() => [...document.querySelectorAll('h1, h2, p')]
      .some((element) => element.offsetParent !== null && element.textContent.includes(${JSON.stringify(text)})))()`);
    if (found) return;
    await sleep(100);
  }
  throw new Error(`Visible text did not appear: ${text}`);
}

async function layoutSnapshot(label) {
  return evaluate(`(() => ({
    label: ${JSON.stringify(label)},
    viewport: [innerWidth, innerHeight],
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    title: [...document.querySelectorAll('h1')]
      .find((element) => element.offsetParent !== null)?.textContent,
    card: (() => {
      const element = [...document.querySelectorAll('.page-card')]
        .find((candidate) => !candidate.closest('[hidden]'));
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        opacity: style.opacity,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animationPlayState: style.animationPlayState,
      };
    })(),
  }))()`);
}

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
});

const layouts = [];

await navigate('/', 375, 812);
await screenshot('01-home-375.png');
layouts.push(await layoutSnapshot('home-mobile'));

await navigate('/host', 390, 844);
await waitForVisibleText('配置模拟游戏');
await screenshot('02-host-config-390.png');
layouts.push(await layoutSnapshot('host-config-mobile'));
await evaluate("document.querySelector('#zone-role-library')?.scrollIntoView({ behavior: 'instant' })");
await sleep(250);
await screenshot('03-role-library-390.png');

await evaluate("scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })");
await sleep(250);
await clickText('确认配置并创建房间');
await waitForVisibleText('模拟房间已创建');
await evaluate("scrollTo({ top: 0, behavior: 'instant' })");
await sleep(250);
await screenshot('04-host-room-390.png');
layouts.push(await layoutSnapshot('host-room-mobile'));

await viewport(320, 568);
await evaluate("document.querySelector('#zone-room-roles')?.scrollIntoView({ behavior: 'instant' })");
await sleep(250);
await screenshot('11-host-roles-se-320.png');
layouts.push(await layoutSnapshot('host-roles-se'));
await clickText('预言家');
await waitForVisibleText('身份牌 · 演示说明');
await screenshot('12-role-dialog-se-320.png');
await clickText('我知道了');
await evaluate("document.querySelector('#zone-room-players')?.scrollIntoView({ behavior: 'instant' })");
await sleep(250);
await screenshot('13-player-order-se-320.png');
const stickyNavigation = await evaluate(`(() => {
  const navigation = document.querySelector('.zone-navigation');
  const rect = navigation.getBoundingClientRect();
  return {
    position: getComputedStyle(navigation).position,
    top: Math.round(rect.top),
    viewportHeight: innerHeight,
    scrollY: Math.round(scrollY),
  };
})()`);

await navigate('/join', 375, 812);
await screenshot('05-player-join-375.png');
await setInput('#room-code', '728314');
await setInput('#nickname', '月光');
await clickText('加入模拟房间');
await waitForVisibleText('准备看牌');
await screenshot('06-player-room-375.png');
layouts.push(await layoutSnapshot('player-room-mobile'));
await evaluate("document.querySelector('#zone-player-identity')?.scrollIntoView({ behavior: 'instant' })");
await sleep(250);
await screenshot('07-identity-covered-375.png');
await clickText('查看我的身份');
await waitForVisibleText('你的身份是');
await screenshot('08-identity-revealed-375.png');

await navigate('/missing-page', 1280, 900);
await screenshot('09-not-found-1280.png');
layouts.push(await layoutSnapshot('not-found-desktop'));

await navigate('/host', 1280, 900);
await waitForVisibleText('配置模拟游戏');
await screenshot('10-host-config-1280.png');
layouts.push(await layoutSnapshot('host-config-desktop'));

await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
const reducedMotion = await evaluate(`(() => ({
  matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
  pageAnimation: getComputedStyle(document.querySelector('.page-card')).animationDuration,
  buttonTransition: getComputedStyle(document.querySelector('.primary-button')).transitionDuration,
}))()`);

console.log(
  JSON.stringify(
    { layouts, stickyNavigation, reducedMotion, browserErrors },
    null,
    2,
  ),
);
socket.close();
