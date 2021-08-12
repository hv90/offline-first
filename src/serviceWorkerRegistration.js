export default function serviceWorkerRegistration() {
  const swUrl = `${process.env.PUBLIC_URL}/serviceworker.js`;
  navigator.serviceWorker.register(swUrl).
}
