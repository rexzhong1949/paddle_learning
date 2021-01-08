	//这段代码的功能是从csv文件中读取坐标,收包数等信息,按照收包成功率统计结果,在地图上用不同颜色线段进行显示
	//csv文件的列按照[时间,经度,纬度,每秒收包个数]排列
	// rexzhong 2021.01.08
	
	
	//由于百度网站对批量地址转换的限制,一次转换10个地址,也限制我们最大统计间隔为10秒
	var SECONDS	= 10;	//以多少秒为一个统计周期
	//每秒发多少个包,由发包测试软件决定
	var PKG_PER_SECOND=10;
	//报文长度(byte),暂时没有用到
	var PKG_LEN=18

	//判决收包成功率的门限
	var GOOD=0.6;		//通信质量挺好,大于等于此门限显示为绿色
	var NORMAL=0.4;		//通信质量一般,大于等于此门限显示为蓝色
	var POOR=0.3;		//通信质量较差,大于等于此门限显示为黄色,低于此门限为极差或中断,显示为红色

	var STROKE_WEIGHT=5;
	var STROKE_OPACITY=1;
	
    var map = new BMap.Map("container");    // 创建地图实例
    var x = 106.44785;
    var y = 29.56712;
    var point = new BMap.Point(x, y);    // 创建点坐标
    map.centerAndZoom(point, 13);    // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true);
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    map.addControl(new BMap.MapTypeControl());
    map.setCurrentCity("重庆");

    function csvToObject(csvString){
        var csvarry = csvString.split("\n");
        var datas = [];
        for(var i = 0;i<csvarry.length;i++){
            var data = {};
            var temp = csvarry[i].split(",");
            for(var j = 0;j<temp.length;j++){
                 data[j] = temp[j];
            }
            datas.push(data);
        }
        return datas;
    }

	

	//绿色表示通信效果好
    translateCallback_green = function (data){
        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'green',
                strokeWeight: STROKE_WEIGHT,
                strokeOpacity: STROKE_OPACITY
            });
        map.addOverlay(polyline);
    }

	//蓝色表示通信效果一般
    translateCallback_blue = function (data){
        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'blue',
                strokeWeight: STROKE_WEIGHT,
                strokeOpacity: STROKE_OPACITY
            });
        map.addOverlay(polyline);
    }

	//黄色表示通信效果差
    translateCallback_yellow = function (data){
        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'yellow',
                strokeWeight: STROKE_WEIGHT,
                strokeOpacity: STROKE_OPACITY
            });
        map.addOverlay(polyline);
    }
    
	//红色线表示通信中断或极差
    translateCallback_red = function (data){
        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'red',
                strokeWeight: STROKE_WEIGHT,
                strokeOpacity: STROKE_OPACITY		//透明度,1为不透明
            });
        map.addOverlay(polyline);
    }

	//从csv文件中读取坐标和收包数等数据
    function readCSVFile(obj) {
        var reader = new FileReader();
        reader.readAsText(obj.files[0]);
         
        var convertor = new BMap.Convertor();
         
        reader.onload = function () {
            var data = csvToObject(this.result);
            //console.log("oring data",data );
            var points = [];
            for(var i=0; i<data.length-1; i++) {
                var point = new BMap.Point(data[i][0], data[i][1]);
                points.push( point );
            }
               
               //以导入的第一个点为地图中心
               map.centerAndZoom(points[points.length/2], 13);

				//按照定义的时间间隔统计收包成功率,完成GPS坐标到百度坐标的变换,根据收包成功概率画出不同颜色路径
				//i+=SECONDS-1是为了使前后两次绘制的线段连接在一起,即后一段的起点是前一段的终点
                for( var i=0; i<points.length-SECONDS; i+=SECONDS-1 )
                {
                    var points_slice = points.slice(i,i+SECONDS)
                    var data_slice = data.slice(i,i+SECONDS)

                    var pkg_rcved=0.0;
                    for( var j=0; j<SECONDS; j++ ){
                        //data[j+i][2]中是每秒收到的报文个数,把一个统计周期内收到的报文个数加起来
                        pkg_rcved += parseInt(data[j+i][2]);
                    }
                    //console.log( "pkg_rcved",pkg_rcved);

					var pkg_success_rate = pkg_rcved/(PKG_PER_SECOND*SECONDS);	//计算这个小时段的收包成功率
					console.log( "pkg_success_rate",pkg_success_rate);
					//根据收包成功率确定画线颜色
                    if ( pkg_success_rate>=GOOD ) {
                        convertor.translate(points_slice, 1, 5, translateCallback_green);                        
                    } else if(pkg_success_rate>=NORMAL) {
                        convertor.translate(points_slice, 1, 5, translateCallback_blue);                       
                    } else if(pkg_success_rate>=POOR) {
                        convertor.translate(points_slice, 1, 5, translateCallback_yellow);
                    } else {
                        convertor.translate(points_slice, 1, 5, translateCallback_red);
                    }
                    
                    //希望通过增加lable显示收包成功率,没有找到坐标转换中返回结果或向回调函数传递额外参数的方法,显示的位置是坐标转换之前的,暂时不用.
                    /*
                    var label_point = points_slice[0];
                    var opts = {
						position: label_point, // 指定文本标注所在的地理位置
						offset: new BMap.Size(30, 0) // 设置文本偏移量
					};
					// 创建文本标注对象
					var label = new BMap.Label(pkg_success_rate.toFixed(2), opts);
					// 自定义文本标注样式
					label.setStyle({
						color: 'black',
						//borderRadius: '1px',
						//bordercolor: '#ccc',
						//padding: '8px',
						border:'0',
						fontSize: '10px',
						height: '10px',
						//lineHeight: '10px',
						fontFamily: '微软雅黑'
					});
					map.addOverlay(label);    
					*/    
                }
        }
    }
