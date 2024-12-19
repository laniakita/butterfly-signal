async function buildLib() {
  console.log('running buildLib()');
  
  const buildRes = await Bun.build({
    entrypoints: ['./src/background.ts'],
    outdir: './public',
  });
  for (const msg of buildRes.logs) {
    console.log(msg);
  }

  console.log('success.')
}

(async () => {
  await buildLib();
})()