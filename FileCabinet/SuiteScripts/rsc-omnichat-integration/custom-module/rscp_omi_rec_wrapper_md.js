/**
 * rscp_omi_rec_wrapper_md.js
 * @NApiVersion 2.x
 */
define(['N/search', 'N/record'],
  function (search, record) {
    /**
     * Create/Update a order.
     *
     * @param {object} orderData
     * @returns {number}
     */
    function createUpdateOrder (orderData) {
      var orderRecord

      const order = findOrder(orderData.orderId)

      if (!order) {
        orderRecord = record.create({
          type: 'customrecord_rscp_omi_order'
        })
      } else {
        orderRecord = record.load({
          type: 'customrecord_rscp_omi_order',
          id: order.id
        })
      }

      orderRecord.setValue({
        fieldId: 'name',
        value: 'Order #' + orderData.orderId
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_id',
        value: orderData.orderId
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_date',
        value: new Date(orderData.createdAt)
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_status',
        value: _getStatusTranslation(orderData.status)
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_salesperson_name',
        value: orderData.salesPerson.name
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_payment_method',
        value: _getPaymentMethodTranslation(orderData.paymentMethod)
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_pay_inst_count',
        value: orderData.paymentInstallmentsCount
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_notes',
        value: orderData.notes.reduce(function (acc, note) {
          return acc ? (acc + '\r\n' + note.text) : note.text
        }, '')
      })

      const customerData = orderData.customer

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_name',
        value: customerData.name + (customerData.lastName || '')
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_firstname',
        value: customerData.name
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_lastname',
        value: customerData.lastName
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_taxdocnum',
        value: customerData.taxDocumentNumber
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_phone',
        value: (customerData.phoneCountryCode ? customerData.phoneCountryCode + ' ' : '') +
        (customerData.phoneAreaCode ? customerData.phoneAreaCode + ' ' : '') +
        customerData.phoneNumber
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_gender',
        value: _getGenderTranslation(customerData.gender)
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_cust_email',
        value: customerData.email
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_delivery',
        value: !orderData.pickUpInStore
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_delivery_time',
        value: orderData.deliveryTime
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_shipping_cost',
        value: orderData.shippingCost
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_zip',
        value: orderData.shippingAddress.zip
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_addrline1',
        value: orderData.shippingAddress.addressLine1
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_addrline2',
        value: orderData.shippingAddress.addressLine2
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_number',
        value: orderData.shippingAddress.number
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_suburb',
        value: orderData.shippingAddress.suburb
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_city',
        value: orderData.shippingAddress.city
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_ship_state',
        value: orderData.shippingAddress.state
      })

      orderRecord.setValue({
        fieldId: 'custrecord_rscp_omi_ord_data',
        value: JSON.stringify(orderData)
      })

      const orderId = orderRecord.save({ ignoreMandatoryFields: true })

      if (!order) {
        orderData.items.forEach(function (item) {
          const itemRecord = record.create({
            type: 'customrecord_rscp_omi_order_item'
          })

          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_order', value: orderId })
          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_name', value: item.name })
          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_prod_ref', value: item.productReference })
          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_description', value: item.description || '' })
          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_quantity', value: item.quantity })
          itemRecord.setValue({ fieldId: 'custrecord_rscp_omi_item_price', value: item.price })

          itemRecord.save({ ignoreMandatoryFields: true })
        })
      }

      return orderId
    }

    /**
     * Find order.
     *
     * @param {string} orderId
     * @returns {object | null}
     */
    function findOrder (orderId) {
      const orderResults = search.create({
        type: 'customrecord_rscp_omi_order',
        filters: [{
          name: 'custrecord_rscp_omi_ord_id',
          operator: search.Operator.IS,
          values: orderId
        }]
      })
        .run()
        .getRange({ start: 0, end: 1 })

      return orderResults.length > 0 ? orderResults[0] : null
    }

    /**
     * Get Status translation
     * @param {string} status
     * @returns {*}
     * @private
     */
    function _getStatusTranslation (status) {
      const statusTranslationTable = {
        'OPEN': 'Criado',
        'WAITING': 'Aguardando pagamento',
        'PAID': 'Pago',
        'NOT_PAID': 'Não pago',
        'ERROR': 'Erro',
        'CANCELLED': 'Cancelado',
        'PACKAGED': 'Empacotado',
        'SHIPPED': 'Enviado',
        'DELIVERED': 'Entregue'
      }
      return statusTranslationTable[status] || status
    }

    /**
     * Get Gender translation
     * @param {string} gender
     * @returns {*}
     * @private
     */
    function _getGenderTranslation (gender) {
      const genderTranslationTable = {
        'male': 'Masculino',
        'female': 'Feminino'
      }
      return genderTranslationTable[gender] || gender
    }

    /**
     * Get Payment Method translation
     * @param {string} paymentMethod
     * @returns {*}
     * @private
     */
    function _getPaymentMethodTranslation (paymentMethod) {
      const paymentMethodTranslationTable = {
        'CREDITCARD': 'Cartão de crédito',
        'BOLETO': 'Boleto',
        'MULTI_BOLETO': 'Multi-Boleto'
      }
      return paymentMethodTranslationTable[paymentMethod] || paymentMethod
    }

    return {
      'createUpdateOrder': createUpdateOrder,
      'findOrder': findOrder
    }
  })
