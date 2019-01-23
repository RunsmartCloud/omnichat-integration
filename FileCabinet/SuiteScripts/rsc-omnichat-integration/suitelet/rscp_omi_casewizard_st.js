/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/redirect', '../custom-module/rscp_omi_translations_md'],
  function (serverWidget, redirect, featureTranslations) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     */
    function onRequest (context) {
      const request = context.request
      const omnichatOrderFieldId = 'omnichat_order'

      if (request.method === 'GET') {
        const translations = featureTranslations.getTranslations()
        const form = serverWidget.createForm({ title: translations.CASE_WIZARD_TITLE })

        form.addField({
          id: omnichatOrderFieldId,
          type: serverWidget.FieldType.TEXT,
          label: translations.CASE_WIZARD_ORDER_FIELD
        })
          .isMandatory = true

        form.addSubmitButton({
          label: translations.CASE_WIZARD_SUBMIT_BUTTON
        })

        context.response.writePage(form)
      } else { // POST
        const parameters = {}

        parameters[omnichatOrderFieldId] = request.parameters[omnichatOrderFieldId]

        redirect.toTaskLink({
          id: 'EDIT_SUPPORTCASE',
          parameters: parameters
        })
      }
    }

    return {
      'onRequest': onRequest
    }
  })
