export function createCoinEffect(x, y) {
  const coinCount =
    Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < coinCount; i++) {
    const coin =
      document.createElement("div");

    coin.className = "coin";
    coin.textContent = "🪙";

    const randomX =
      (Math.random() - 0.5) * 120;

    const randomY =
      -Math.random() * 120 - 40;

    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;

    coin.style.setProperty(
      "--x",
      `${randomX}px`
    );

    coin.style.setProperty(
      "--y",
      `${randomY}px`
    );

    document.body.appendChild(coin);

    setTimeout(function () {
      coin.remove();
    }, 700);
  }
}