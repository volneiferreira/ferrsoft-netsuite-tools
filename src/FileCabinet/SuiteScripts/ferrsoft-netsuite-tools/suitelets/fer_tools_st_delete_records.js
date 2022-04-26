/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/task', 'N/url', 'N/search'],
  function (serverWidget, task, url, search) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     */
    function onRequest (context) {
      const request = context.request
      const response = context.response
      const savedSearchFieldId = 'custpage_saved_search'
      const form = serverWidget.createForm({ title: 'Excluir registros' })

      form.clientScriptModulePath = '../clients/fer_tools_cl_delete_records.js'

      if (request.method === 'GET') {
        form.addField({
          id: savedSearchFieldId,
          type: serverWidget.FieldType.SELECT,
          label: 'BUSCA SALVA',
          source: '-119'
        })
          .isMandatory = true

        form.addSubmitButton({
          label: 'Excluir'
        })
      } else {//POST
        const savedSearchId = request.parameters[savedSearchFieldId]

        const deleteTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          scriptId: 'customscript_fer_tools_mr_delete_records',
          params: {
            custscript_fer_tools_saved_search: savedSearchId
          }
        })

        deleteTask.submit()

        const taskLinkField = form.addField({
          id: 'custpage_task_link',
          type: serverWidget.FieldType.URL,
          label: 'LINK DA TAREFA'
        })

        taskLinkField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
        taskLinkField.linkText = 'Clique para visualizar o andamento da tarefa'
        taskLinkField.defaultValue = url.resolveTaskLink({
          id: 'LIST_MAPREDUCESCRIPTSTATUS',
          params: {
            scripttype: _getTaskScriptId(),
            sortcol: 'dcreated',
            sortdir: 'DESC',
            date: 'TODAY',
            primarykey: ''
          }
        })

        const savedSearchLinkField = form.addField({
          id: 'custpage_saved_search_link',
          type: serverWidget.FieldType.URL,
          label: 'LINK DA BUSCA SALVA'
        })

        savedSearchLinkField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE })
        savedSearchLinkField.linkText = 'Clique para visualizar sua busca'
        savedSearchLinkField.defaultValue = url.resolveTaskLink({
          id: 'LIST_SEARCHRESULTS',
          params: {
            searchid: savedSearchId
          }
        })
      }

      response.writePage({
        pageObject: form
      })
    }

    /**
     * Get task script ID.
     *
     * @returns {number}
     * @private
     */
    function _getTaskScriptId () {
      return search.create({
        type: search.Type.MAP_REDUCE_SCRIPT,
        filters: [{
          name: 'name',
          operator: search.Operator.IS,
          values: 'fer_tools_mr_delete_records'
        }]
      })
        .run()
        .getRange({
          start: 0,
          end: 1
        })
        .reduce(function (a, r) {
          return r.id
        }, '')
    }

    return {
      onRequest: onRequest
    }
  })
