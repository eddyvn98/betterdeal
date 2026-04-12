async function test() {
  try {
    console.log('Testing fetch availability...');
    const res = await fetch('https://www.google.com');
    console.log('Status:', res.status);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
