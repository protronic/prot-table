import Vue from 'vue'
import Vuex from 'vuex';
// import console from 'core-js';


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /** stores the table data in unchanged form. */
    originalData: [],
    
    /** stores the sorted table data. */
    sortedData: {
      data: [],
      currentSortKey: '',
      currentSortDir: '',
      previousSorts: []
    },

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
  getters: {
    get_sortability (state, getters){
      let result = {};
      if(state.tableOptions.sortability){
        for(let key in state.tableOptions.sortability){
          result[key] = state.tableOptions.sortability[key];
        }
      }
      if(Object.keys(result).length < getters.get_header_list.length){
        for(let i = 0; i < getters.get_header_list.length; i++){
          if(!Object.keys(result).includes(getters.get_header_list[i])){
            result[getters.get_header_list[i]] = 'auto';
          }
        }
      }
      for(let key in result){
        if(result[key] === 'auto'){
          result[key] = state.originalData.map(value => (value[key])).reduce( (collector, current) => {
            if(current && Number.isNaN(Number(current))){
              return 'abc';
            }
            return '123';
          }, '123');
        }
      }

      return result;
    },
    get_header_list(state){
      try{
        let header_fields = state.originalData.map( value => (Object.keys(value)) ).reduce( (collector, current) => {
          for (let i in current){
            if (!collector.includes(current[i])) 
              collector.push(current[i])
          }            
          return collector;
        }
        , []);

        return(header_fields);
      }
      catch(err){
        console.error(err);
        return [];
      }
    },
  },
  mutations: {
    set_table_data (state, tableData){
      state.originalData = tableData;
      state.sortedData.data = tableData;
    },
    override_table_option (state, tableOptions){
      for(let key in tableOptions){
        state.tableOptions[key] = tableOptions[key];
      }
    },
    update_header_keys (state, headerList){
      state.headerList = headerList;
    },
    sort_data (state, {sort_key, sort_type}){
      let previous_key = state.sortedData.currentSortKey;
      if (previous_key) state.sortedData.previousSorts.push(previous_key);
      state.sortedData.currentSortKey = sort_key;
      state.sortedData.currentSortDir = (sort_key === previous_key) ? (state.sortedData.currentSortDir === 'asc' ? 'desc' : 'asc') : ('asc');
      state.sortedData.data = state.sortedData.data.slice().sort( (a, b) => {
        if(sort_type === '123'){
          return state.sortedData.currentSortDir === 'asc' ? Number(a[sort_key]) - Number(b[sort_key]) : Number(b[sort_key]) - Number(a[sort_key]);
        }
        else{
          if(a[sort_key] > b[sort_key]){
            return state.sortedData.currentSortDir === 'asc' ? 1 : -1;
          }
          else if(a[sort_key] < b[sort_key]){
            return state.sortedData.currentSortDir === 'asc' ? -1 : 1;
          }
          else return 0;
        }
      });
    }
  },
  actions: {
    fetch_table_data ({commit}, url){
      return fetch(url)
        .then( response => {
          console.log(response);
          if(response.ok) {
            return response.json();
          }
          else 
            throw `Got response ${response.status} from ${url}.`
        })
        .then( data => {
          // console.log(data);
          commit('set_table_data', data);
        });
    },
    sort_action({commit, getters}, sort_key){
      return new Promise( (resolve, reject) => {
        try{
          commit('sort_data', {sort_key: sort_key, sort_type: getters.get_sortability[sort_key]});
          resolve();
        }
        catch(err){
          reject(err);
        }
      })
    }
  }
});

