/**
 * rscp_omi_translations_md.js
 * @NApiVersion 2.x
 */
define(['N/runtime'],
  function (runtime) {
    const translationsTable = {
      'default': {
        CASE_WIZARD_TITLE: 'Create case from Omnichat order',
        CASE_WIZARD_ORDER_FIELD: 'Order ID',
        CASE_WIZARD_SUBMIT_BUTTON: 'Create',
        CASE_CONFIRM_MESSAGE: 'Do you want to load the information for this order?'
      },
      'pt_BR': {
        CASE_WIZARD_TITLE: 'Criar chamado a partir de um pedido do Omnichat',
        CASE_WIZARD_ORDER_FIELD: 'Número do pedido',
        CASE_WIZARD_SUBMIT_BUTTON: 'Criar',
        CASE_CONFIRM_MESSAGE: 'Deseja carregar as informações deste pedido?'
      }
    }

    /**
     * Get translations.
     *
     * @returns {object}
     */
    function getTranslations () {
      const language = runtime.getCurrentUser().getPreference({ name: 'language' })
      const translations = translationsTable[language]
      return translations || translationsTable['default']
    }

    return {
      'getTranslations': getTranslations
    }
  })
