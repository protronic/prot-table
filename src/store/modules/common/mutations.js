import Vue from 'vue';

const set_table_data = function(state, tableData){
  state.originalData = tableData;
  state.sortedData.data = tableData;
};

const override_table_option = function(state, tableOptions){
  for(let key in tableOptions){
    Vue.set(state.tableOptions, key, tableOptions[key])
    // state.tableOptions[key] = tableOptions[key];
  }
};

const update_header_keys = function(state, headerList){
  state.headerList = headerList;
};

const replace_match_filter = function(state, newMatchFilter){
  state.tableOptions.filters.matchFilter = newMatchFilter;
};

const sort_data = function(state, {sort_key, sort_type}){
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
};

export default {
  set_table_data,
  override_table_option,
  update_header_keys,
  replace_match_filter,
  sort_data
}