/* global URL, WebSocket, console, fetch, setTimeout */

import { writeFile } from 'node:fs/promises';

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
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
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
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function viewport(width, height, mobile = true) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await sleep(200);
}

async function screenshot(filename) {
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  await writeFile(new URL(filename, import.meta.url), result.data, 'base64');
}

async function clickSelector(selector) {
  const clicked = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    element.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Selector not found: ${selector}`);
  await sleep(180);
}

async function clickText(text) {
  const clicked = await evaluate(`(() => {
    const element = [...document.querySelectorAll('button, label')]
      .find((candidate) => candidate.textContent.includes(${JSON.stringify(text)}));
    if (!element) return false;
    element.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Text control not found: ${text}`);
  await sleep(180);
}

async function clickSeat(number) {
  const clicked = await evaluate(`(() => {
    const number = ${number};
    const marker = [...document.querySelectorAll('.seat-target__number')]
      .find((candidate) => candidate.textContent.trim() === String(number));
    const button = marker?.closest('button');
    if (!button || button.disabled) return false;
    button.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Seat not available: ${number}`);
  await sleep(180);
}

await send('Page.enable');
await send('Runtime.enable');
await viewport(375, 812, false);
await send('Page.navigate', { url: 'about:blank' });
await sleep(150);
await send('Page.navigate', {
  url: 'http://127.0.0.1:5173/#/host/night-demo',
});
await sleep(900);
await viewport(375, 812, false);
await screenshot('01-intro-375.png');

const introLayout = await evaluate(`(() => {
  const footer = document.querySelector('.night-action-footer').getBoundingClientRect();
  const primary = document.querySelector('.night-action-footer > button').getBoundingClientRect();
  return {
    viewport: [innerWidth, innerHeight],
    footer: [Math.round(footer.top), Math.round(footer.bottom)],
    primary: [Math.round(primary.top), Math.round(primary.bottom)],
  };
})()`);

await clickSelector('.acknowledgement-card input');
await clickText('开始夜间流程');
await viewport(390, 844);
await clickSeat(3);
await screenshot('02-guard-selected-390.png');

const mobileLayout = await evaluate(`(() => {
  const footer = document.querySelector('.night-action-footer').getBoundingClientRect();
  return {
    viewport: [innerWidth, innerHeight],
    scrollWidth: document.documentElement.scrollWidth,
    footerBottom: Math.round(footer.bottom),
    targetCount: document.querySelectorAll('.seat-target').length,
  };
})()`);

await evaluate('scrollTo(0, document.documentElement.scrollHeight)');
await sleep(250);
await screenshot('03-guard-bottom-390.png');
await clickText('确认并继续 ·');
await clickSeat(4);
await clickText('确认并继续 ·');
await clickSeat(5);
await clickText('确认查验 ·');
await screenshot('04-seer-result-390.png');
await clickText('已完成手势，继续');
await clickText('使用毒药');
await clickSeat(7);
await evaluate(
  "scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })",
);
await sleep(250);
await screenshot('05-witch-poison-390.png');
await clickText('确认使用毒药');
await clickSelector('.acknowledgement-card input');
await clickText('查看结算预览');
await viewport(1280, 900, false);
await screenshot('06-resolution-1280.png');
await evaluate(
  "scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })",
);
await sleep(250);
await screenshot('07-resolution-bottom-1280.png');

const desktopLayout = await evaluate(`(() => ({
  viewport: [innerWidth, innerHeight],
  scrollWidth: document.documentElement.scrollWidth,
  privateCards: document.querySelectorAll('.resolution-card--private').length,
  publicCards: document.querySelectorAll('.resolution-card--public').length,
}))()`);

await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
const reducedMotion = await evaluate(`(() => {
  const stage = document.querySelector('.night-demo__stage');
  return {
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    animationDuration: getComputedStyle(stage).animationDuration,
    transitionDuration: getComputedStyle(document.querySelector('.night-progress__track span')).transitionDuration,
  };
})()`);

await clickText('确认结算预览');
await viewport(390, 844);
await evaluate("scrollTo({ top: 0, behavior: 'instant' })");
await sleep(250);
await screenshot('08-complete-390.png');

console.log(
  JSON.stringify(
    { introLayout, mobileLayout, desktopLayout, reducedMotion },
    null,
    2,
  ),
);
socket.close();
