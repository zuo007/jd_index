function getElementTop(elem){
  //获得当前elem的offsetTop，保存在变量sum中
  var sum=elem.offsetTop;
  while((elem=elem.offsetParent)!=null){
    //获得当前elem的offsetTop，累加到sum
    sum+=elem.offsetTop;
  }
  return sum;
}
var elevator={
  UPLEVEL:0,//保存亮灯范围的上限距文档显示区顶部的距离
  DOWNLEVEL:0,//保存亮灯范围的下限距文档显示区顶部的距离
  FHEIGHT:0,//保存楼层的高度
  
  DURATION:1000,//保存动画的总时间
  DISTANCE:0,//保存动画的总距离
  STEPS:200,//保存动画的总步数
  interval:0,//保存每步的时间间隔
  step:0,//保存步长
  moved:0,//保存本次动画已经移动的步数，控制停止定时器
  timer:null,//保存定时器序号，专门用于停止定时器

  init:function(){
    //计算FHEIGTH:id为f1的元素计算后的height
                //+id为f1的元素计算后的marginBottom
    this.FHEIGHT=
      parseFloat(getComputedStyle($("#f1")).height)+
      parseFloat(getComputedStyle($("#f1")).marginBottom);
    //计算UPLEVEL:(文档显示区高-FHEIGHT)/2
    this.UPLEVEL=(window.innerHeight-this.FHEIGHT)/2;
    //计算DOWNLEVEL:UPLEVEL+FHEIGHT
    this.DOWNLEVEL=this.UPLEVEL+this.FHEIGHT;
    //为当前窗口绑定页面滚动事件为checkLight
    window.addEventListener(
      "scroll",this.checkLight.bind(this));
    //为id为elevator下的ul绑定鼠标进入事件function(){
    $("#elevator>ul").addEventListener(
      "mouseover",function(e){
      var target=e.target;
      if(target.nodeName=="A"){//如果target是a
        //就将target换成target的父元素
        target=target.parentNode;
      }
      if(target.nodeName=="LI"){//如果target是li
        //将target下最后一个子元素显示
        target.lastElementChild.style.display="block";
        //将target下第一个子元素隐藏
        target.firstElementChild.style.display="none";
      }
    });
    //为id为elevator下的ul绑定鼠标移出事件function(){
    $("#elevator>ul").addEventListener(
      "mouseout",function(e){
      var target=e.target;
      if(target.nodeName=="A"){//如果target是a
        //就将target换成target的父元素
        target=target.parentNode;
      }
      if(target.nodeName=="LI"){//如果target是li
        //计算和当前li对应的span的位置下标i:target下的第一个子元素的内容转为整数后-1
        var i=parseInt(
          target.firstElementChild.innerHTML)-1;
        //找到class为floor下的header元素下的span中第i个，保存在变量span中
        var span=$(".floor>header>span")[i];
        //如果span的class不是hover
        if(span.className!="hover"){
          //将target下最后一个子元素隐藏
          target.lastElementChild.style.display="none";
          //将target下第一个子元素显示
          target.firstElementChild.style.display="block";
        }
      }
    });
    //计算interval: DURATION/STEPS
    this.interval=this.DURATION/this.STEPS;
    var me=this;
    //为id为elevator下的ul绑定单击事件为function(){
    $("#elevator>ul").addEventListener(
      "click",function(e){
      if(me.timer==null){
      var target=e.target;
      //如果target是A且目标元素的class为etitle
      if(target.nodeName=="A"
        &&target.className=="etitle"){
        //获得当前页面滚动的距离scrollTop
        var scrollTop=document.documentElement.scrollTop
                    ||document.body.scrollTop;
        //计算span的下标i: target的前一个兄弟元素的内容转为整数-1
        var i=parseInt(
          target.previousElementSibling.innerHTML)-1;
        //获取class为floor下的header元素下的span中第i个，保存在变量span中
        var span=$(".floor>header>span")[i];
        //获得span距页面顶部的总距离elemTop
        var elemTop=getElementTop(span);
        //计算DISTANCE:elemTop-(UPLEVEL+scrollTop)
        me.DISTANCE=elemTop-(me.UPLEVEL+scrollTop);
        //计算step:DISTANCE/STEPS
        me.step=me.DISTANCE/me.STEPS;
        //启动一次性定时器，放入moveStep，时间间隔设置为interval，将序号保存在timer中
        me.timer=setTimeout(
          me.moveStep.bind(me),me.interval);
      }
      }
    })
  },
  moveStep:function(){//this->me->elevator
    //让浏览器滚动一个step的距离
    window.scrollBy(0,this.step);
    this.moved++;//moved+1
    if(this.moved<this.STEPS){//如果moved<STEPS
      //启动一次性定时器，放入moveStep，时间间隔设置为interval，将序号保存在timer中
      this.timer=setTimeout(
          this.moveStep.bind(this),this.interval);
    }else{//否则(移动结束后)
      this.timer=null;this.moved=0;//清除timer，moved归0
    }
  },
  checkLight:function(){//专门检查每个楼层的灯的亮灭
    //查找class为floor下的header元素下的直接子元素span,保存在spans中
    var spans=$(".floor>header>span");
    //获得当前页面滚动过的高度scrollTop
    var scrollTop=document.documentElement.scrollTop||
                  document.body.scrollTop;
    //遍历spans中每个span
    for(var i=0;i<spans.length;i++){
      //调用getElementTop获得当前span距页面顶部的高度，保存在top中
      var top=getElementTop(spans[i]);
      //计算当前span距文档显示区顶部的距离: top-scrollTop，保存在变量elemTop
      var elemTop=top-scrollTop;
      //查找id为elevator下的ul下的li中第i个，保存在变量li中
      var li=$("#elevator>ul>li")[i];
      //如果elemTop>=UPLEVEL且elemTop<=DOWNLEVEL
      if(elemTop>=this.UPLEVEL&&elemTop<=this.DOWNLEVEL){
        //设置当前span的class为hover
        spans[i].className="hover";
        //设置li下最后一个子元素显示
        li.lastElementChild.style.display="block";
        //设置li下第一个字元素隐藏
        li.firstElementChild.style.display="none";
      }else{//否则清除当前span的class
        spans[i].className="";
        //设置li下最后一个子元素隐藏
        li.lastElementChild.style.display="none";
        //设置li下第一个字元素显示
        li.firstElementChild.style.display="block";
      }
    }
    //查找class为floor下的header元素下的class为hover的span保存在变量span中
    var span=$(".floor>header>span.hover");
    //设置id为elevator的div的display为:
      //如果span不等于null，设置为block，否则设置为none
    $("#elevator").style.display=
      span!=null?"block":"none";
  }
}
window.addEventListener("load",function(){
  elevator.init()
});