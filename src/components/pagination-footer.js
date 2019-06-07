
export default {
  get_pagination_component(pagination){
    return {
      data: function(){
        return {
          pagination: pagination,
        };
      },
      template: `
        <div id="footer" ref="footer" v-show="pagination.paginationState.total_pages > 1">
          <div class="firstPage pageEnd" @click="pagination.paginationState.current_page = 0">&lt;&lt;</div>
          <div class="previousPage pageSelect" @click="pagination.paginationState.current_page = Math.max(pagination.paginationState.current_page - 1, 0)">&lt;</div>
          <div v-for="(e, i) in [...Array(Math.min(pagination.paginationState.total_pages, 9))]" :key="i" class="pageSelect" @click="pagination.paginationState.current_page = i">{{i + 1}}</div>
          <div v-show="pagination.paginationState.total_pages > 9" class="pageSelect">..</div>
          <div class="nextPage pageSelect" @click="pagination.paginationState.current_page = Math.min(pagination.paginationState.current_page + 1, pagination.paginationState.total_pages - 1)">&gt;</div>
          <div class="lastPage pageEnd" @click="pagination.paginationState.current_page = pagination.paginationState.total_pages - 1">&gt;&gt;</div>
        </div>`      
    }
  }
}
