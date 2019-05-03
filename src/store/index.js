import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

const store = new Vuex.Store({});

export default store;

// /* eslint-disable no-console */
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
      previousSorts: [],
      previousSort_dirs: [],
    },

    /** stores all options the table got called with. TODO remove test values. */
    // tableOptions: {
    //   'height': '400px',
    //   'sortability': {
    //     'address': (a, b) => (Number(a.address.split(' ').pop()) - Number(b.address.split(' ').pop()))
    //   },
    //   'tableStyles': {},
    //   'headerStyles': {'font-weight': 'bold'},
    //   'bodyStyles': {},
    //   'rowStyles': [{
    //     check_row: (rowValues /*, rowIndex, vuexState, vuexGetters */ ) => ((rowValues['company'] && rowValues['company'] === 'INJOY') ? true : false),
    //     styles: {'background': 'lightgreen'}
    //   },{
    //     check_row: (rowValues /*, rowIndex, vuexState, vuexGetters */ ) => ((rowValues['index'] && rowValues['index'] > 40) ? true : false),
    //     styles: {'background': 'lightblue'}
    //   }],
    //   'colStyles': {'address': {'text-align': 'right'}},
    //   'formatter': {
    //     'index': (value /*, rowIndex, vuexState, vuexGetters */ ) => ((value < 10) ? `0${value}` : value),
    //     'isActive': (value /*, rowIndex, vuexState, vuexGetters */ ) => ((value) ? 'yes' : 'no'),
    //     'address': (value) => ((value) ? value.split(',').map( token => ((token.match(/\s[0-9]{3,4}/gm) ? `<span style="color: red;">${token}</span>` : token))).join(',') : '')
    //   },
    //   'cssVariables': {'--header-background': 'white'},
    //   'dontShowCols': ['_id'],
    //   'filters': {
    //     'connection_operation': 'and',
    //     'matchFilter': {},
    //     'inputRegExp': true,
    //     'showInputs': true,
    //   },
    // },
    tableOptions: {
      "height": "400px", 
      "sortability": {},
      "tableStyles": {},
      "headerStyles": {},
      "bodyStyles": {},
      "rowStyles": [],
      "colStyles": {},
      "formatter": {},
      "cssVariables": {},
      "dontShowCols": [],
      "filters": {
        "connection_operation": "and",
        "matchFilter": {},
        "showInputs": true,
        "inputRegExp": true
      }
    }
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

        return header_fields.filter(value => {                    
          return !state.tableOptions.dontShowCols.includes(value);
        });
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
        Vue.set(state.tableOptions, key, tableOptions[key])
        // state.tableOptions[key] = tableOptions[key];
      }
    },
    update_header_keys (state, headerList){
      state.headerList = headerList;
    },
    replace_match_filter(state, newMatchFilter){
      state.tableOptions.filters.matchFilter = newMatchFilter;
    },
    sort_data (state, {sort_key, sort_type}){
      let previous_key = state.sortedData.currentSortKey;
      let previous_dir = state.sortedData.currentSortDir;
      if (previous_key) state.sortedData.previousSorts.push(previous_key);
      if (previous_dir) state.sortedData.previousSort_dirs.push(previous_dir);
      state.sortedData.currentSortKey = sort_key;
      state.sortedData.currentSortDir = (sort_key === previous_key) ? (previous_dir === 'asc' ? 'desc' : 'asc') : ('asc');
      if (typeof sort_type !== 'function'){
        state.sortedData.data = state.sortedData.data.slice().sort( (a, b) => {
          if(sort_type === '123'){
            return Number(a[sort_key]) - Number(b[sort_key]);
          }
          else{
            if(a[sort_key] > b[sort_key]){
              return 1;
            }
            else if(a[sort_key] < b[sort_key]){
              return -1;
            }
            else return 0;
          }
        });
      }
      else{
        state.sortedData.data = state.sortedData.data.slice().sort(sort_type);
      }
      if(state.sortedData.currentSortDir === 'desc'){
        state.sortedData.data.reverse();
      }
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

