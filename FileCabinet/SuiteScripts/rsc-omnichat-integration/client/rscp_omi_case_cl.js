/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', '../custom-module/rscp_omi_translations_md'],
  function (dialog, featureTranslations) {
    /**
     * Function to be executed after page is initialized.
     *
     * @param {object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.mode - The mode in which the record is being accessed (create, copy, or edit)
     */
    function pageInit (context) {
      // Disable onbeforeunload message.
      window.onbeforeunload = function () {}
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {object} context
     * @param {Record} context.currentRecord - Current form record
     * @param {string} context.sublistId - Sublist name
     * @param {string} context.fieldId - Field name
     * @param {number} context.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
     */
    function fieldChanged (context) {
      const fieldId = context.fieldId

      if (fieldId !== 'custevent_rscp_omi_order_id') return

      const currentRecord = context.currentRecord
      const orderId = currentRecord.getValue({ fieldId: fieldId })

      if (orderId) {
        const translations = featureTranslations.getTranslations()

        dialog.confirm({
          title: 'Omnichat',
          message: translations.CASE_CONFIRM_MESSAGE
        })
          .then(function (result) {
            if (!result) return

            const parameters = window.location.search
            const omnichatOrderParamName = 'omnichat_order'

            if (parameters.indexOf(omnichatOrderParamName) !== -1) {
              window.location.search = parameters.replace(/(omnichat_order=)(\d+)/, '$1' + orderId)
            } else {
              window.location.search += (parameters ? '&' : '?') + omnichatOrderParamName + '=' + orderId
            }
          })
      }
    }

    return {
      'pageInit': pageInit,
      'fieldChanged': fieldChanged
    }
  })
