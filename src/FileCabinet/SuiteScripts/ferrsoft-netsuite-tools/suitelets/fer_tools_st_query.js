/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/query', 'N/ui/serverWidget'],
  (query, serverWidget) => {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     */
    const onRequest = (context) => {
      const form = serverWidget.createForm({ title: 'Query Tool' })

      form.addSubmitButton({ label: 'Run Query' })

      const queryField = form.addField({
        id: 'custpage_field_query',
        type: serverWidget.FieldType.LONGTEXT,
        label: 'Query'
      })

      queryField.isMandatory = true

      const request = context.request
      const parameters = request.parameters

      if (request.method === 'POST') {
        queryField.defaultValue = parameters.custpage_field_query

        const resultsField = form.addField({
          id: 'custpage_field_results',
          type: serverWidget.FieldType.LONGTEXT,
          label: 'Results'
        })

        try {
          const queryResults = query.runSuiteQL({ query: parameters.custpage_field_query })

          const beginTime = new Date().getTime()
          const records = queryResults.asMappedResults()
          const endTime = new Date().getTime()
          const elapsedTime = endTime - beginTime

          resultsField.label = queryResults.results.length + ' Results (JSON)'
          resultsField.defaultValue = JSON.stringify(records, null, 2)

          if (records.length > 0) {
            const resultsSublist = form.addSublist({
              id: 'results_sublist',
              label: 'Results (' + records.length + ' records retrieved in ' + elapsedTime + 'ms)',
              type: serverWidget.SublistType.LIST
            })

            const columnNames = Object.keys(records[0])

            columnNames.forEach((column, columnIndex) => {
              resultsSublist.addField({
                id: 'custpage_results_sublist_col_' + columnIndex,
                type: serverWidget.FieldType.TEXT,
                label: column
              })
            })

            records.forEach((record, recordIndex) => {
              columnNames.forEach((column, columnIndex) => {
                const value = record[column]
                resultsSublist.setSublistValue({
                  id: 'custpage_results_sublist_col_' + columnIndex,
                  line: recordIndex,
                  value: value === null ? '-- NULL --' : value.toString()
                })
              })
            })
          }
        } catch (e) {
          resultsField.label = 'Error'
          resultsField.defaultValue = e.message
        }
      }

      const jsField = form.addField({
        id: 'custpage_field_js',
        type: serverWidget.FieldType.INLINEHTML,
        label: 'Javascript'
      })

      jsField.defaultValue = `
        <script>
          document.getElementById("custpage_field_query").rows = 20;
          var resultsInput = document.getElementById("custpage_field_results")
          if (resultsInput) {
            resultsInput.rows = 20;
          }
          window.jQuery = window.$ = jQuery;
          $("textarea").keydown(function(e) {
            if (e.keyCode === 9) {
              var start = this.selectionStart;
              var end = this.selectionEnd;
              var $this = $(this);
              var value = $this.val();
              $this.val(value.substring(0, start) + " " + value.substring(end));
              this.selectionStart = this.selectionEnd = start + 1;
              e.preventDefault();
            }
          });
        </script>
      `

      context.response.writePage({ pageObject: form })
    }

    return { onRequest }
  })
