import Vue from 'vue'
import Vuex from 'vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /** stores the table data in unchanged form. */
    originalData: [],
    
    /** stores the sorted, filtered, etc table data. */
    mutatedData: [],

    /** stores all options the table got called with. */
    tableOptions: {
      'height': 'auto',
      'sortability': {},
      'tableStyles': {},
      'headerStyles': {},
      'bodyStyles': {},
      'rowStyles': {},
      'colStyles': {},
      'formatter': {},
      'cssVariables': {},

    },
  },
  mutations: {
    set_table_data (state, tableData){
      state.originalData = tableData;
      [].sort()
    },
    override_table_option (state, tableOptions){
      for(let key in tableOptions){
        state.tableOptions[key] = tableOptions[key];
      }
    }
  },
  actions: {
    fetch_table_data({commit}, url){
      return fetch(url)
        .then( response => {
          if(response.ok) {
            return response.json();
          }
          else 
            throw `Got response ${response.status} from ${url}.`
        })
        .then( data => {
          commit('set_table_data', data);
        })
      }
    }
});

