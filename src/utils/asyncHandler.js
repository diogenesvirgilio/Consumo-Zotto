/*Wrapper para handlers async do Express que captura erros e passa para next()
 @param {Function} fn Handler async que pode lançar erro 
 @returns {Function} Handler wrapped que trata erros automaticamente
*/

export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
