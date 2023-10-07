
const measureQueryTime = async (queryFunction, queryName) => {
   const startTime = Date.now();

   // Выполните запрос с переданной функцией
   return queryFunction()
      .then((result) => {
         const endTime = Date.now();
         const elapsedTime = endTime - startTime;

         console.log(`${queryName} выполнено за ${elapsedTime} миллисекунд`);

         // Верните результат выполнения запроса
         return result;
      })
      .catch((error) => {
         console.error(`${queryName} завершилось с ошибкой: ${error}`);
         throw error; // Пересылка ошибки для обработки дальше, если необходимо
      });
}
module.exports = measureQueryTime
