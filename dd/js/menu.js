  // 手风琴菜单
  var Menu = function(el, multiple, open) {
    // el 手风琴菜单的容器
    // multiple 是否可以同时打开多个折叠菜单 默认是false
    this.el = el || {};
    this.$el = $(this.el);
    // 把布局的类名统一保存起来，方便维护
    this.titleClssName = "item-title";
    this.openClassName = "open";
    this.activeClassName = "active";
    this.datasetName = "data-tid";
    this.multiple = multiple || false;
    this.$submenuListItem = this.el.find(".submenu-list-item");
    // IE8不支持ES5中的indexOf方法。给数组原型绑定indexOf方法。only for IE8
    if(!Array.prototype.indexOf){
      Array.prototype.indexOf = function(item){
        len = this.length;
        for(;i<len && item !== this[i];i++);
        return i === len ? -1:i ;
      }
    }
    this.bindEvent();
  };
  // h2的点击事件处理函数
  Menu.prototype.dropdown = function(e) {
    var
    // 取出传递给该处理函数的数据
      data = e.data,
      multiple = data.multiple,
      self = data.self,
      $submenuListItem = data.$submenuListItem,
      $el = data.el,
      // 当前被点击的h2元素的jq对象
      $this = $(this),
      // 取出所有h2对象
      $h2 = $el.find("."+self.titleClssName),
      // 当前被点击的h2的索引
      index = $h2.index($this),
      // 取出上一次被点击的索引
      oldIndex = $el.data("oldIndex");
    $next = $this.next();
    // 折叠
    $next.slideToggle();
    $this.parent().toggleClass(self.openClassName);
    // 去掉上次被点击的h2的active
    $h2.eq(oldIndex).removeClass(self.activeClassName);
    // 当h2被点击时，所有的子菜单项都应该去掉active效果
    $submenuListItem.each(function(index, every) {
        $(every).removeClass(self.activeClassName);
      })
      // 给当前被点击的对象添加active效果
    $this.addClass(self.activeClassName);
    // 更新oldIndex
    $el.data("oldIndex", index);
    if (!multiple) {
      $submenuListItem.parent().not($next).slideUp().parent().removeClass(self.openClassName);
    }
  }
  Menu.prototype.bindEvent = function() {
    var
      h2 = this.el.find("."+this.titleClssName),
      self = this;
    /*
      首先绑定h2的点击处理事件。传给事件处理函数的数据包括：
      el:菜单容器
      multiple:是否多项展开
      $submenuListItem:子菜单项jq对象
    */
    h2.on("click", {
      el: this.el,
      self: self,
      multiple: self.multiple,
      $submenuListItem: self.$submenuListItem
    }, self.dropdown);
    // 绑定子菜单项的点击事件
    self.$submenuListItem.on("click", function() {
      // 首先去掉所有的子菜单项的选中样式
      self.$submenuListItem.each(function(index, every) {
          $(every).removeClass(self.activeClassName);
      })
        // 再去掉所有h2的选中样式
      h2.each(function(index, every) {
          $(every).removeClass(self.activeClassName);
      })
        // 最后，给被点击的子菜单项添加active样式
      $(this).toggleClass(self.activeClassName);
    })
  }
  /*
  获取所有链接中的data-tid属性
*/
  Menu.prototype.getIdList = function(){
     var $el = this.$el,
         $itemTitle = $el.find('.'+this.titleClssName),
         i = 0,len,id,
         idList = [];
    $itemTitle.each(function(index,item){
       if(item.dataset){
        id = item.dataset.tid;
       }else{
        id = item.getAttribute(this.datasetName);
       }
       if(id && idList.indexOf(id) === -1){
            idList.push(id)
       }    
    });
    this.$submenuListItem.each(function(index,item){
       if(item.dataset){
        id = item.dataset.tid;
       }else{
        id = item.getAttribute(this.datasetName);
       }
       if(id && idList.indexOf(id) === -1){
            idList.push(id)
       }    
    });
    return idList;
  }
  /*
   获取所有open状态下的菜单的id
  */
  Menu.prototype.getIdListByOpen = function($open){
      var 
          $itemTitle = $open.find("."+this.titleClssName),
          idList = [$itemTitle.attr(this.datasetName)],
          liArr = $itemTitle.next().children();
          len = liArr.length,i=0;
          while(i<len){
            idList.push(liArr[i++].getAttribute("data-tid"));
          }
          return idList;
  }
  /*
   折叠所有
  */
  Menu.prototype.closeAll = function(tid){
     // 找到打开的菜单并关闭
     // TODO:加一个判断
     // 若父菜单打开的话，点击子菜单父菜单不用折叠再打开了
     // 如果点击的就是它本身的话，就折叠或者展开，就不需要折叠一次再展开了
     var $el = this.$el,$open = $el.find('.'+this.openClassName),idList=this.getIdListByOpen($open);
        $el.find("."+this.activeClassName).removeClass(this.activeClassName);
        $open.removeClass(this.openClassName);
        if(idList.indexOf(tid) != -1){return;}
        $open.find("."+this.titleClssName).next().slideUp();
    }
  /*
   通过唯一的data-tid来打开
  */
  Menu.prototype.openById = function(tid){
     // 折叠打开的菜单
     this.closeAll(tid);
     var $el = this.$el,
         active = $el.find('['+this.datasetName+'='+tid+']'),$h2 = $el.find('.'+this.titleClssName),
         activeParent = active.parent();
     active.addClass(this.activeClassName);
     // 如果该元素是 .item-title的话，父元素应该有open状态
     if(active.hasClass(this.titleClssName)){
       activeParent.addClass(this.openClassName);
       active.next().slideDown();
       $el.data("oldIndex", $h2.index(active));
     }else{
       // 否则就是submenu-list-item元素
       activeParent.parent().addClass(this.openClassName);
       activeParent.slideDown();
       $el.data("oldIndex", $h2.index(activeParent.prev()));
     }
  }