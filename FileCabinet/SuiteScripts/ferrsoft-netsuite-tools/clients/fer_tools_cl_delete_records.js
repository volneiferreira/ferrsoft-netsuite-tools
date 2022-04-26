/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
  function () {
    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} context
     * @param {Record} context.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     */
    function saveRecord (context) {
      const currenRecord = context.currentRecord
      const savedSearchName = currenRecord.getText({ fieldId: 'custpage_saved_search' })
      return confirm('ATENÇÃO: Todos os registros da busca ' + savedSearchName + ' serão excluídos. Deseja realmente continuar?')
    }

    return {
      saveRecord: saveRecord
    }
  })
