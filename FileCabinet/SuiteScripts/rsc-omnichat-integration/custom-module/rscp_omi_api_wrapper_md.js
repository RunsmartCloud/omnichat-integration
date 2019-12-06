/**
 * rscp_omi_api_wrapper_md.js
 * @NApiVersion 2.x
 */
define(['N/url', 'N/https'],
  function (url, https) {
    /**
     * Get order.
     *
     * @param {string} id
     */
    function getOrder (id) {
      const omnichatResponse = https.get({
        url: _getCommunicatorEndpoint({
          endpoint: '/orders',
          filter: _buildFilter({ retailerOrderId: id })
        })
      })

      if (omnichatResponse.code === 200) {
        const orders = JSON.parse(omnichatResponse.body)
        if (orders.length > 0) {
          return orders[0]
        }
      }

      return null
    }

    /**
     * Get customer.
     *
     * @param {string} id
     */
    function getCustomer (id) {
      const omnichatResponse = https.get({
        url: _getCommunicatorEndpoint({
          endpoint: '/customers',
          filter: _buildFilter({ objectId: id })
        })
      })

      if (omnichatResponse.code === 200) {
        const customers = JSON.parse(omnichatResponse.body)
        if (customers.length > 0) {
          return customers[0]
        }
      }

      return null
    }

    /**
     * Return the communicator endpoint.
     *
     * @param {object} parameters
     * @returns {string}
     * @private
     */
    function _getCommunicatorEndpoint (parameters) {
      return url.resolveScript({
        scriptId: 'customscript_rscp_omi_communicator_st',
        deploymentId: 'customdeploy_rscp_omi_communicator_st',
        returnExternalUrl: true,
        params: parameters
      })
    }

    /**
     * Build filter.
     *
     * @param {object} data
     * @returns {string}
     * @private
     */
    function _buildFilter (data) {
      return 'where=' + JSON.stringify(data)
    }

    return {
      'getOrder': getOrder,
      'getCustomer': getCustomer
    }
  })
