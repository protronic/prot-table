import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const namespaced = true;

export default {
  namespaced,
  state () {
    return {
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
    }
  },
  actions,
  getters,
  mutations
};
