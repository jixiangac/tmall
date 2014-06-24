/*-------------------------------------------/
 * 入口
 * Created on 2014-06-21 23:19:11
 * @author: jixiangac(几羊)
 * @email: jixiang.hjx@alibaba-inc.com
 *-------------------------------------------*/
;KISSY.add('tmall-f2e/main', function (S, Base, $, U, Xtemplate) {
   'use strict';

   var EMPTY = '';
   var APIURL = 'https://api.github.com/repos/lifesinger/lifesinger.github.com/issues';
   // var APIURL = 'https://api.github.com/repos/tmallfe/tmallfe.github.io/issues';
   var CONTENT = '#J_Content';
   var _STORE_CLS = 'tmall-f2e-blog-list';
   var _STORE_CLS_PAGE = 'tmall-f2e-blog-page';

   var EVENT_CLICK = U.isTouchEventSupported() ? 'tap' : 'click';

   function Main(config) {
   	  var self = this;
      Main.superclass.constructor.call(self, config);
      this.init();
   }
   var param = {
   	 init: function () {
        var self = this;
        marked.setOptions({
          renderer: new marked.Renderer(),
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: true,
          smartLists: true,
          smartypants: false
        });
        self.initStore();
   	 },
     render: function () {
        var self = this;
        self.step1();
        self.initArchive();
        self.initSideBar();
     },
     /**
      * 初始化storage，
      * 然后进行第一步动画
      * @return {[type]} [description]
      */
     initStore: function () {
        var self = this;
        S.getScript('http://g.tbcdn.cn/mui/storage/1.1.0/basic.js', function () {
            S.use('mui/storage/basic', function (S, Storage) {
               self.Storage || (self.Storage = Storage);
               self.render();
            });
        });
     },
     initHashEvents: function () {
        var self = this;
        function change() {
            var hash = self.getHash();
            if (hash) {
                self.renderPage( self.get('id') , {
                       url: hash.html_url,
                       title: hash.title,
                       author: hash.user.login,
                       date: hash.created_at.split('T')[0]
                });
            } 
        }
        change();
        $.one(window).on('hashchange', function() {
            change();
        });
     },
     /**
      * 第一步动画
      * LOGO变小，list出现
      * @return {[type]} [description]
      */
     step1: function () {
        var self = this;
        // setTimeout(function () {
           // $.one('#logo').addClass('after');
           $.one('.list', '#main').fadeIn();
           $.one('.list-wrap', '#main').removeClass('init');
           self.getList();
        // }, 500);
     },
     /**
      * 获取列表
      * 从storage取列表，如果存在就不再请求
      * @return {[type]} [description]
      */
     getList: function () {
        var self = this;
        var Storage = self.Storage;
        function render(data) {
            self.set('datas', data);
            var _data = self.formateData( S.clone(data) );
            self.renderList(_data);
            self.pagenav();
            self.initHashEvents();
        }
        var cfg = {
           url: APIURL,
           success: function (data) {
              Storage.set(_STORE_CLS, data);
              render(data);
           }
        };
        var _data_ = Storage.get(_STORE_CLS);
        if (_data_) {
            render(_data_);
        } else {
            U.ajax(cfg);
        }
        $.one('.list', '#main').addClass('show');
     },
     hasPageNo: function () {
        var self = this;
        var data = self.get('datas');
        var hash = parseInt( window.location.hash.replace(/#page/gi, ''), 10);
        var find = false;
        var datas = null;
        for(var i = 0, len = data.length; i < len; i ++) {
           var _d = data[i];
           if ( _d.number === hash) {
              find = true;
              datas = _d;
              break;
           }
        }
        if ( find ) {
           self.set('id', hash);
        }
        return {
           find: find,
           data: datas
        };
     },
     getHash: function () {
        var self = this;
        var hash = window.location.hash;
        if (hash) {
            var hasPageNo = self.hasPageNo();
            if (hasPageNo.find) {
               return hasPageNo.data;
            }
        }
        return false;
     },
     /**
      * 数据分页
      * @param  {[type]} data [description]
      * @return {[type]}      [description]
      */
     formateData: function (data) {
        var self = this;
        var num = 12;
        var m = 0;
        var datas = [];
        var step = self.step = Math.ceil( data.length / num );
        for (var i = 0; i < step; i ++) {
           var _d = data.splice(m, num);
           datas.push(_d);
        }
        return datas;
     },
     /**
      * 生成分页，分页事件
      * @return {[type]} [description]
      */
     pagenav: function () {
        var self = this;
        if (self.step <= 1) {
           return 0;
        }
        var tpl = '';
        for(var i = 1, len = self.step; i <= len; i ++) {
          if (i == 1) {
             tpl += '<li class="cur"><a>' + i + '</a></li>';
          } else {
             tpl += '<li><a>' + i + '</a></li>';
          }
        }

        $.one('#J_PageNav').html(tpl);

        var lists = $.all('.list', '#main');
        var before_index = 0;

        $.one('#J_PageNav').delegate(EVENT_CLICK, 'li', function (e) {
            e.halt();
            var $target = $.one(e.currentTarget);
            var index = $target.index();
            if ( $target.hasClass('cur') ) {
              return;
            }
            $target.addClass('cur').siblings().removeClass('cur');
            $.one( lists[index] ).addClass('show').removeClass('scale');
            $.one( lists[before_index] ).addClass('scale').removeClass('show');
            setTimeout(function () {
               lists.removeClass('scale');
            }, 500);
            before_index = index;
        });
     },
     /**
      * 渲染列表
      * @param  {[type]} data [description]
      * @return {[type]}      [description]
      */
     renderPage: function (id, side) {
          var self = this;
          var Storage = self.Storage;
          var _renderPage = function(data) {
              $.one('.main', CONTENT).html( marked(data) );
          }

          $.one('#wrapper').addClass('perspective effect-moveleft animate');
          $.one('.main', CONTENT).addClass('show');
          $.one('body').addClass('single-page');

          var cfg = {
            url: APIURL + '/' + id,
            success: function (data) {
                Storage.set(_STORE_CLS_PAGE + id, data.body);
                _renderPage(data.body);
            }
          }
          var _data_ = Storage.get(_STORE_CLS_PAGE + id);
          if ( _data_ ) {
            _renderPage(_data_);
          } else {
            U.ajax(cfg);
          }
          side && self.renderSibar(side);       
     },
     renderList: function(data) {
       var self = this;
       var $list = $.one('.list-wrap', '#main');
       var Storage = self.Storage;
       var _tpl = $.one('#J_ListTpl').text();
       var TPL = new Xtemplate(_tpl).render({
          data: data
       });
       $list.html(TPL);
       /*--------------------------------------
        * perspective effect-moveleft animate
        *------------------------------------*/
       var $WRAP = $.one('#wrapper');
       // var $CLOSE = $.one('#J_Close');
       function renderPage(data) {
          $.one('.main', CONTENT).html( marked(data) );
       }
       $.one('.list-wrap', '#main').delegate(EVENT_CLICK, 'a', function (e) {
          e.halt();
          var $target = $.one(e.currentTarget);
          var id = $target.attr('data-id');
          window.location.hash = 'page' + id;
          // var side = {
          //    url: $target.attr('href'),
          //    title: $target.text(),
          //    author: $target.attr('data-author'),
          //    date: (function(){
          //        var _date = $target.attr('data-date');
          //        if (!_date) {
          //           return "";
          //        }
          //        return _date.split('T')[0]
          //    }())
          // }
          // self.renderPage(id, side);
       });
       
       $.one('#J_ToolBar').delegate(EVENT_CLICK, '#J_Close', function (e) {
          e.halt();
          var that = this;
          window.location.hash = "";
          $.one(that).addClass('hide');
          $WRAP.removeClass('animate');
          $.one('body').removeClass('single-page');
          setTimeout(function () {
            $WRAP.removeClass('effect-moveleft');
          }, 500);
          $.one('.main', CONTENT).removeClass('show');
          setTimeout(function () {
              $.one(that).removeClass('show hide');
          }, 300);
       });
     },
     /**
      * 归档事件
      * @return {[type]} [description]
      */
     initArchive: function () {
        var self = this;
        if ( !S.get('#J_Archive') ) {
           return;
        }
        var $Content = $.one('#J_ArchiveContent');
        var $Wrap = $.one('#wrapper');
        var $Close = $.one('#J_ArchiveClose');
        var render = false;

        function renderArchive() {
           var tpl = $.one('#J_ArchiveTpl').text();
           var data = self.get('datas');
           var _data = U.groupByYear( S.clone(data) );
           var _tpl = new Xtemplate(tpl).render({
             data: _data
           });
           $.one('.listing', '#J_ArchiveContent').html(_tpl);
        }

        $.one('#J_Archive').on(EVENT_CLICK, function (e) {
           e.halt();
           $Content.addClass('open');
           $Wrap.addClass('bodyscale scale');
           $Close.addClass('show');
           if (!render) {
              render = true;
              renderArchive();
           }
        });

        $Close.on(EVENT_CLICK, function (e) {
           e.halt();
           $Content.removeClass('open');
           $Wrap.removeClass('scale');
           $Close.removeClass('show');
        });
     },
     /**
      * 侧边栏事件
      */
     initSideBar: function () {
        var self = this;
        var FNUM = 550;
        $.one(window).on('scroll', function (e) {
            var scrollTop = $.one(window).scrollTop();
            var dwidth = $.one(document).outerWidth(true);
            // alert(dwidth)
            var _num = FNUM;
            if ( dwidth <= 1240) {
               _num = 20;
            }
            // if ( $.on)
            if (scrollTop > _num) {
                $.one('#J_ToolBar').addClass('fixed');
            } else {
                $.one('#J_ToolBar').removeClass('fixed');
            }
        });
     },
     renderSibar: function (data) {
        var self = this;
        var tpl = $.one('#J_SideTpl').text();
        var _tpl = new Xtemplate(tpl).render(data);
        $.one('#J_ToolBar').html(_tpl);
     }
   }

   S.extend(Main, Base);
   S.augment(Main, param);
   
   return Main;
},{
  requires:[
    'base',
    'node',
    'tmall-f2e/utils',
    'xtemplate'
  ]
});