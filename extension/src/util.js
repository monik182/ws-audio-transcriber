export const waitUntil = async (conditionFunc, tickTime, maxTime) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      maxTime -= tickTime;

      if (maxTime <= 0) {
        clearInterval(interval);
        reject();
      }

      if (conditionFunc()) {
        clearInterval(interval);
        resolve();
      }

    }, tickTime);
  });
}
