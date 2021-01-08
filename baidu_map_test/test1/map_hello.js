    var map = new BMap.Map("container");    // 创建地图实例
    var x = 106.44785;
    var y = 29.56712;
    var point = new BMap.Point(x, y);    // 创建点坐标
    map.centerAndZoom(point, 15);    // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true);
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    map.addControl(new BMap.MapTypeControl());
    map.setCurrentCity("重庆");

    var marker = new BMap.Marker(point);        // 创建标注
    map.addOverlay(marker);                     // 将标注添加到地图中

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

    translateCallback_red = function (data){
        //for (var i = 0; i < data.points.length; i++) {
        //    var Marker = new BMap.Marker(data.points[i])
        //    map.addOverlay(Marker);
        //}

        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'red',
                strokeWeight: 10,
                strokeOpacity: 0.5
            });
        map.addOverlay(polyline);
    }

    translateCallback_green = function (data){
        //for (var i = 0; i < data.points.length; i++) {
        //    var Marker = new BMap.Marker(data.points[i])
        //    map.addOverlay(Marker);
        //}

        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'green',
                strokeWeight: 10,
                strokeOpacity: 0.5
            });
        map.addOverlay(polyline);
    }

    translateCallback_blue = function (data){
        //for (var i = 0; i < data.points.length; i++) {
        //    var Marker = new BMap.Marker(data.points[i])
        //    map.addOverlay(Marker);
        //}

        var polyline = new BMap.Polyline(data.points,
            {
                strokeColor: 'blue',
                strokeWeight: 10,
                strokeOpacity: 0.5
            });
        map.addOverlay(polyline);
    }

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

               //for (var i = 0; i < points.length; i++) {
               //    map.addOverlay(new BMap.Marker(points[i]));
               //    map.setCenter(data.points[i]);
               //}

                for( var i=0; i<points.length-10; i+=9 )
                {
                    var points_slice = points.slice(i+0,i+10)
                    var data_slice = data.slice(i+0,i+10)
                    //console.log("points_slice",points_slice);
                    //console.log("data_slice",data_slice);
                    var color = 0;
                    for( var j=0; j<10; j++ ){
                        //if (data[j+i][2]=="1") {
                        //    color ++;
                        //}
                        color += parseInt(data[j+i][2]);
                    }
                    console.log( color);

                    if ( color>=70 ) {
                        convertor.translate(points_slice, 1, 5, translateCallback_green);
                    } else if(color<30) {
                        convertor.translate(points_slice, 1, 5, translateCallback_red);
                    } else {
                        convertor.translate(points_slice, 1, 5, translateCallback_blue);
                    }
                }
        }
    }