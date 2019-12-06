/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', '../custom-module/rscp_omi_api_wrapper_md', '../custom-module/rscp_omi_rec_wrapper_md'],
  function (runtime, search, record, omnichatApiWrapper, omnichatRecWrapper) {
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     */
    function beforeLoad (context) {
      if (context.type !== context.UserEventType.CREATE ||
        runtime.executionContext !== runtime.ContextType.USER_INTERFACE) return

      const omnichatOrderId = context.request.parameters.omnichat_order

      if (omnichatOrderId) {
        // Find order into Omnichat and create into NetSuite if not exists.
        const order = omnichatApiWrapper.getOrder(omnichatOrderId)

        const orderRecordData = {
          id: ''
        }

        if (order) {
          const cust = omnichatApiWrapper.getCustomer(order.customerId)
          orderRecordData.id = omnichatRecWrapper.createUpdateOrder(order, cust)
        } else {
          orderRecordData.id = omnichatRecWrapper.findOrder(omnichatOrderId)
        }

        if (!orderRecordData.id) return

        // Create customer if not exists.
        const orderRecordColumns = [
          'custrecord_rscp_omi_ord_cust_email',
          'custrecord_rscp_omi_ord_cust_firstname',
          'custrecord_rscp_omi_ord_cust_lastname',
          'custrecord_rscp_omi_ord_cust_phone'
        ]

        const orderRecordValues = search.lookupFields({
          type: 'customrecord_rscp_omi_order',
          id: orderRecordData.id,
          columns: orderRecordColumns
        })

        const email = orderRecordValues[orderRecordColumns[0]]

        if (email) {
          const customerResults = search.create({
            type: search.Type.CUSTOMER,
            filters: [{
              name: 'email',
              operator: search.Operator.IS,
              values: email
            }]
          })
            .run()
            .getRange({ start: 0, end: 1 })

          const customerData = {
            id: ''
          }

          if (customerResults.length > 0) {
            customerData.id = customerResults[0].id
          } else {
            const customer = record.create({
              type: record.Type.CUSTOMER
            })

            customer.setValue({ fieldId: 'isperson', value: 'T' })
            customer.setValue({ fieldId: 'email', value: email })

            const firstName = orderRecordValues[orderRecordColumns[1]]
            if (firstName) {
              customer.setValue({ fieldId: 'firstname', value: firstName })
            }

            const lastName = orderRecordValues[orderRecordColumns[2]]
            if (lastName) {
              customer.setValue({ fieldId: 'lastname', value: lastName })
            }

            const phone = orderRecordValues[orderRecordColumns[3]]
            if (phone) {
              customer.setValue({ fieldId: 'phone', value: phone })
            }

            customerData.id = customer.save({ ignoreMandatoryFields: true })
          }

          context.newRecord.setValue({
            fieldId: 'company',
            value: customerData.id
          })
        }

        context.newRecord.setValue({
          fieldId: 'custevent_rscp_omi_order',
          value: orderRecordData.id
        })
      }
    }

    return {
      'beforeLoad': beforeLoad
    }
  })
