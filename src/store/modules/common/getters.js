/* eslint-disable no-console */

const get_sortability = function(state, getters){
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
};

const get_header_list = function(state){
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
};

export default {
  get_sortability,
  get_header_list
};