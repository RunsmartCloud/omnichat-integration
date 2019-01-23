/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/https'],
  function (runtime, https) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     */
    function onRequest (context) {
      const request = context.request
      const parameters = request.parameters
      const currentScript = runtime.getCurrentScript()

      const apiEndPoint = currentScript.getParameter({ name: 'custscript_rscp_omi_apiendpoint' }) +
        parameters.endpoint +
        (parameters.filter ? '?' + parameters.filter : '')
      const apiKey = currentScript.getParameter({ name: 'custscript_rscp_omi_apikey' })
      const apiSecret = currentScript.getParameter({ name: 'custscript_rscp_omi_apisecret' })

      const omnichatRequest = {
        url: apiEndPoint,
        headers: {
          'x-api-key': apiKey,
          'x-api-secret': apiSecret,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      if (request.body) {
        omnichatRequest.body = request.body
      }

      const omnichatResponse = https[request.method.toLowerCase()](omnichatRequest)

      context.response.write(omnichatResponse.body)
    }

    return {
      'onRequest': onRequest
    }
  })
