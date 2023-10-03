<script>
  const s = () => {
    console.log("s");
    // create web audio api context
    const audioCtx = new window.AudioContext();

    // create Oscillator node
    const oscillator = audioCtx.createOscillator();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(432, audioCtx.currentTime); // value in hertz
    oscillator.connect(audioCtx.destination);
    oscillator.start();
  };
</script>

<button on:click={s}>s</button>