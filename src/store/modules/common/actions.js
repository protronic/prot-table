const fetch_table_data = function({commit}, url){
  return fetch(url)
    .then( response => {
      // console.log(response);
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
};

const sort_action = function({commit, getters}, sort_key){
  return new Promise( (resolve, reject) => {
    try{
      commit('sort_data', {sort_key: sort_key, sort_type: getters.get_sortability[sort_key]});
      resolve();
    }
    catch(err){
      reject(err);
    }
  })
};

export default {
  fetch_table_data,
  sort_action
};