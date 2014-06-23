/*-------------------------------------------/
 * 工具类
 * Created on 2014-06-19 18:19:11
 * @author: jixiangac(几羊)
 * @email: jixiang.hjx@alibaba-inc.com
 *-------------------------------------------*/
KISSY.add('tmall-f2e/utils', function(S, IO) {
	/**
	 * 基础类
	 */
	var U = {
		/**
		 * URL的分解处理
		 * @param  {[type]} url [description]
		 * @return {[type]}     [description]
		 */
		segment: function(url) {
			var RE_URL_SEG = /^(https?:\/\/.+?)(\?(.*?))?(#(.*?))?$/;
			var obj = {
				url: '',
				qs: '',
				hash: ''
			};
 
			//考虑 null、unefined 等情况，需要做这个处理
			if (!url) {
				return obj;
			}
			url += '';
 
			var ms = RE_URL_SEG.exec(url);
			//U.log(ms);
			if (!ms) {
				return obj;
			}
 
			obj.url = ms[1] ? ms[1] : '';
			obj.qs = ms[3] ? ms[3] : '';
			obj.hash = ms[5] ? ms[5] : '';
			return obj;
		},
		ajax: function (cfg) {
			new IO({
	             url: cfg.url
	           , type: cfg.type || 'get'
	           , data: cfg.data
	           , dataType: cfg.dataType || 'json'
	           , timeout: cfg.timeout || 30
	           , cache: false
	           , beforeSend: function () {
	               // cfg.container && cfg.container.addClass('xloading')
	               cfg.beforeSend && cfg.beforeSend();
	           }
	           , success: function (res) {
	               // cfg.container && cfg.container.removeClass('xloading');
	                   cfg.success(res);
	           }
	           , error: function (data, textStatus) {
	                var tips = (textStatus == 'timeout') ? '获取数据超时，请重新再试!' : '服务器响应出错！';
	                alert(textStatus);
	                // alert(tips);
	           }
	        });
		},
		isTouchEventSupported: function () {
			return S.Features.isTouchEventSupported();
		}
	}
	/**
	 * 格式类
	 */
	var F = {
	  /**
	   * 时间格式化
	   * @param  {[type]} date   [description]
	   * @param  {[type]} format [description]
	   * @return {[type]}        [description]
	   */
	  dateFormat : function(date, format) {
	      var now = date; 
	      var o = {
	        "M+": now.getMonth() + 1, //month
	        "d+": now.getDate(), //day
	        "h+": now.getHours(), //hour
	        "m+": now.getMinutes(), //minute
	        "s+": now.getSeconds(), //second
	        "q+": Math.floor((now.getMonth() + 3) / 3), //quarter
	        "S": now.getMilliseconds() //millisecond
	      }
	      if (/(y+)/.test(format)) {
	        format = format.replace(RegExp.$1, (now.getFullYear() + "")
	          .substr(4 - RegExp.$1.length));
	      }
	 
	      for (var k in o) {
	        if (new RegExp("(" + k + ")").test(format)) {
	          format = format.replace(RegExp.$1,
	            RegExp.$1.length == 1 ? o[k] :
	            ("00" + o[k]).substr(("" + o[k]).length));
	        }
	      }
	      return format;
	    },
	    /**
	     * 格式化成千分位
	     * @param  {[type]} num [description]
	     * @return {[type]}     [description]
	     */
	    thousandFormat: function (num) {
          return String(num).replace(/\B(?=(\d{3})+$)/g,',');
	    },
	    groupByYear: function (data) {
	       var self = this;

	       var _data = S.map(data, function (item) {
              return {
              	 created_at: item.created_at,
              	 html_url: item.html_url,
              	 labels: item.labels,
              	 number: item.number,
              	 title: item.title,
              	 user: item.user
              }
	       });

	       var datas = {};

	       S.each(_data, function (item) {
               var date = item.created_at.split('T');
               var year = self.dateFormat( new Date(date[0]), 'yyyy' );
               item.times = new Date(date[0]).getTime();
               item.date = date[0];
               !datas[year] && (datas[year]=[]);
               datas[year].push(item);
	       });
           
           var datas2 = [];

	       S.each(datas, function (v, k) {
              v.sort(function (a, b) {
                 if (a.times > b.times) {
                 	 return -1;
                 } else if (a.times < b.times) {
                 	 return 1;
                 } else {
                 	 return 0;
                 }
              });

              datas2.push({
              	year: + k,
              	datas: v
              });
	       });

	       datas2.sort(function (a, b) {	       	 
				 if (a.year > b.year) {
                 	 return -1;
                 } else if (a.year < b.year) {
                 	 return 1;
                 } else {
                 	 return 0;
                 }         
	       });

           return datas2;
	    }
	}
    
    S.mix(U, F);
	return U;
}, {
	requires: ['io']
});