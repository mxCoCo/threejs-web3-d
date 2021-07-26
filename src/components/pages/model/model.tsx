import React, { useEffect, useState,useRef } from 'react';
import { IconFont } from '../../iconfont/iconfont';
import styles from  './model.module.scss';
import { Slider, Button, Spin, message as Message } from "antd";
import Logo from '../../common/images/logo.png';
import SessionStorage from '../../../comm/sessionStorage';
import * as THREE from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';
import {createScene} from './comm/scene';
import {createCamera} from './comm/camera';
import {createRenderer} from './comm/renderer';
import {dealGLTFLoader} from './comm/dealGLTFLoader';
import {createLights} from './comm/lights';
import {createOrbitControls} from './comm/orbitControls';
import {createBox} from './comm/box3';



/**
 * icon 图标
 */
const  formatIcon = (iconName:any,size?:any) => {
  if(size){
    return iconName ? (<IconFont type={iconName} size={size}/>) : undefined;
  }else {
    return iconName ? (<IconFont type={iconName}/>) : undefined;
  }
}

let modelWidth: any;
let modelHeight: any;
let scene: any;
let camera: any;
let controls: any;
let Box: any;
let renderer: any;
let sceneData: any;

let isMove: any = false;
let mouseX: any = 0;
let mouseY: any = 0;
/**handleRotation方式旋转 */
let rotateStartPoint = new THREE.Vector3(0, 0, 1);
let rotateEndPoint = new THREE.Vector3(0, 0, 1);
let rotationSpeed = 50;
let curQuaternion:any;

const Model3D = (props: any) => {
  const modelWrapRef:any = useRef();
  const canvasRef:any = useRef();
  const optPaneRef:any = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const [sliderSize,setSliderSize] = useState<any>(30);
  const [meshData,setMeshData] = useState<any>();
  const [showAxes,setShowAxes] = useState<any>(true);
  // 模型初始化缩放大小值
  const [initScale,setInitScale] = useState<any>(0);
  const [progressText, setProgressText] = useState("loading......");

  useEffect(() => {
    setIsLoading(true);
    const cacheAccessId = SessionStorage.get("accessId");
    if(cacheAccessId){
      renderModel(cacheAccessId);
    }else {
      const val = getSearchParam("accessId");
      if(val){
        SessionStorage.set("accessId",val);
        renderModel(val);
        return;
      }
      if(props.location.state && props.location.state.accessId){
        const val = props.location.state.accessId;
        SessionStorage.set("accessId",val);
        renderModel(val);
      }
    }
    
    return ()=>{
      SessionStorage.remove("accessId");
      window.removeEventListener('resize', onWindowResize);
    }
  }, [])
  useEffect(() => {
    if(IsPC()){
      canvasRef.current.onmousedown = onMouseDown
      canvasRef.current.onmousemove = onMouseMove
      canvasRef.current.onmouseup = onMouseUp
    }
  }, [])

  /**绑定模型点击事件 */
  const onMouseDown = (event:any) => {
    isMove = true;
    if(!IsPC()){
      if(event.touches && event.touches.length > 1){
        return;
      }
      if (event.changedTouches) {
          let touch = event.changedTouches[0]; //touches数组对象获得屏幕上所有的touch，取第一个touch
          // 手动控制旋转的坐标
          mouseX = touch.pageX;
          mouseY = touch.pageY;
      }
    }else {
      // 手动控制旋转的坐标
      mouseX = event.pageX;
      mouseY = event.pageY;
    }
  }
  /**绑定模型移动事件 */
  const onMouseMove = (e:any) => {
    if (isMove) {
      let x = 0;
      let y = 0;
      if(!IsPC()){
        if(e.touches && e.touches.length > 1){
          return;
        }
        if (e.changedTouches) {
          let touch = e.changedTouches[0]; //touches数组对象获得屏幕上所有的touch，取第一个touch
          x = touch.pageX;
          y = touch.pageY;
        }
      }else {
        x = e.pageX;
        y = e.pageY;
      }
      
      let _x = x - mouseX;
      let _y = y - mouseY;
      const groupArr = scene.children.filter((one:any) => one.type =='Group');
      const axesArr = scene.children.filter((one:any) => one.type =='AxesHelper');
      groupArr.forEach((g:any)=>{
        // g.rotation.x += _y * (Math.PI / 180);
        // g.rotation.y += _x * (Math.PI / 180);
        // const deltaRotationQuaternion = new THREE.Quaternion()
        //   .setFromEuler(new THREE.Euler(
        //         _y * (Math.PI / 180),
        //         _x * (Math.PI / 180),
        //       0,
        //       'XYZ'
        //   ));
  
        //   g.quaternion.multiplyQuaternions(deltaRotationQuaternion, g.quaternion);
        handleRotation(g,_x,_y)
      })
      axesArr.forEach((g:any)=>{
        // g.rotation.x += _y * (Math.PI / 180);
        // g.rotation.y += _x * (Math.PI / 180);
        // const deltaRotationQuaternion = new THREE.Quaternion()
        //   .setFromEuler(new THREE.Euler(
        //         _y * (Math.PI / 180),
        //         _x * (Math.PI / 180),
        //       0,
        //       'XYZ'
        //   ));
  
        //   g.quaternion.multiplyQuaternions(deltaRotationQuaternion, g.quaternion);
        handleRotation(g,_x,_y)
      })
      mouseX = x;
      mouseY = y;
      render();
    }
  }
  /**绑定模型移动结束事件 */
  const onMouseUp = () => {
    isMove = false;
  }

  const handleRotation = (cube:any, deltaX:any, deltaY:any) => {
      rotateEndPoint = projectOnTrackball(deltaX, deltaY);

      let rotateQuaternion = rotateMatrix(rotateStartPoint, rotateEndPoint);
      curQuaternion = cube.quaternion;
      curQuaternion.multiplyQuaternions(rotateQuaternion, curQuaternion);
      curQuaternion.normalize();
      cube.setRotationFromQuaternion(curQuaternion);

      rotateEndPoint = rotateStartPoint;
  };

  const rotateMatrix = (rotateStart:any, rotateEnd:any) =>{
      var axis = new THREE.Vector3(),
          quaternion = new THREE.Quaternion();

      var angle = Math.acos(rotateStart.dot(rotateEnd) / rotateStart.length() / rotateEnd.length());

      if (angle)
      {
          axis.crossVectors(rotateStart, rotateEnd).normalize();
          angle *= rotationSpeed;
          quaternion.setFromAxisAngle(axis, angle);
      }
      return quaternion;
  }

  const projectOnTrackball = (touchX:any, touchY:any) => {
      var mouseOnBall = new THREE.Vector3();

      mouseOnBall.set(
          clamp(touchX / window.innerWidth / 2, -1, 1), clamp(-touchY / window.innerHeight / 2, -1, 1),
          0.0
      );

      var length = mouseOnBall.length();

      if (length > 1.0)
      {
          mouseOnBall.normalize();
      }
      else
      {
          mouseOnBall.z = Math.sqrt(1.0 - length * length);
      }

      return mouseOnBall;
  }

  const clamp = (value:any, min:any, max:any) => {
      return Math.min(Math.max(value, min), max);
  }

  /**
     * 获取浏览器请求参数
     * @param key 
     * @returns 
     */
  const getSearchParam = (key:any) => {
    const { search } = props.location;
    const paramsString = search.substring(1);
    const searchParams = new URLSearchParams(paramsString);
    const value = searchParams.get(key);
    return value;
  }

  /**判断当前环境是否为pc端 */
  const IsPC = () => {
    let userAgentInfo = navigator.userAgent;
    let Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    let flag = true;
    for (let v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
  }

  /**
   * 模型渲染方法
   */
  const renderModel = async (accessId:any) => {
    // 检查当前环境是否支持
    if (!WEBGL.isWebGLAvailable()) {
      const warning = WEBGL.getWebGLErrorMessage();
      document.getElementById('container')?.appendChild(warning);
    }
    resizeListener();
    modelWidth = canvasRef.current.clientWidth;
    modelHeight = canvasRef.current.clientHeight;
    let viewEle: any = document.getElementById("view-wrapper");

    // return;
    // 创建场景scene
    scene = createScene();
    // 创建相机camera
    camera = createCamera(modelWidth,modelHeight);
    // 控制相机缩放比例
    let html = document.documentElement;
    let clientW = html.clientWidth;
    if(clientW <= 750){
      camera.aspect = 3/ 4;
    }
    // if(clientW <= 750){
    //   camera.aspect = 3/ 3.2;
    // }else if(clientW <= 900){
    //   camera.aspect = 3/ 5.5;
    // }else if(clientW <= 1200){
    //   camera.aspect = 3/ 4;
    // }else if(clientW <= 1440){
    //   camera.aspect = 3/ 4;
    // }else if(clientW <= 1680){
    //   camera.aspect = 3/ 3.5;
    // }else if(clientW <= 1920){
    //   camera.aspect = 3/ 2.1;
    // }
    // 创建渲染器renderer
    renderer = createRenderer(modelWidth,modelHeight);
    // dom添加渲染文档到页面
    viewEle.appendChild(renderer.domElement);
    // 添加坐标轴
    let axesHelper = new THREE.AxesHelper(30000);
    axesHelper.name="axes";
    scene.add( axesHelper );
    // 请求加载模型数据
    sceneData = await dealGLTFLoader(accessId,setProgressText);
    if(!sceneData){
      Message.warn('模型加载失败');
    }
    setIsLoading(false);

    if(sceneData){
      scene.add(sceneData);
      setMeshData(sceneData);
    }
    // 添加灯光
    const { ambientLight, mainLight_one, mainLight_two, mainLight_three, mainLight_four, mainLight_five, mainLight_six } = createLights();
    scene.add(ambientLight,mainLight_one, mainLight_two, mainLight_three, mainLight_four, mainLight_five, mainLight_six );

    // 根据模型数据、创建包围盒、计算模型大小和中心位置
    if(sceneData){
      Box = createBox(sceneData);
      frameArea(Box.boxSize * 1.0, Box.boxSize, Box.boxCenter, camera);
      
      let scale = getFitScaleValue(sceneData);
      sceneData.scale.set(scale,scale,scale);
      setInitScale(scale);
    }
    // 创建控制器、控制模型显示旋转变化
    controls = createOrbitControls(camera,renderer.domElement);
    // controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 0.1; // 设置最小缩放距离，也就是模型最大的缩放比例
    controls.maxDistance = 20; // 设置最大缩放距离，也就是模型最小的缩放比例
    controls.rotateSpeed = 1; //旋转速度 
    controls.enableRotate = false; //是否可以旋转
    controls.enablePan = false; //是否可以平移
    controls.enableZoom = false; //是否可以缩放
    controls.minPolarAngle = 0; //垂直旋转最小的角度
    controls.maxPolarAngle = Math.PI; //垂直旋转最大的角度 Math.PI
    controls.minAzimuthAngle = 0; //水平旋转最小的角度
    controls.maxAzimuthAngle = 2*Math.PI; //水平旋转最小的角度
    // controls.target.set(0, 0, 0);// 设置控制器旋转轴的位置
    controls.update();
    
    render();
    window.addEventListener('resize', onWindowResize);
  }

  /**获取真实缩放比例 */
  const getRealRate = (rate:any) => {
    if(rate <= 0.01){
      return rate*15;
    }else if(rate > 0.01 && rate <= 0.1){
      return rate*15;
    }else if(rate > 0.1 && rate <= 1){
      return rate*2;
    }else if(rate > 1 && rate <= 10){
      return rate;
    }else if(rate > 10 && rate <= 100){
      return rate/3;
    }else if(rate > 100 && rate <= 1000){
      return rate/3;
    }else if(rate > 1000 && rate <= 3000){
      return rate/100;
    }

  }

  /**计算真实缩放比例 */
  const getFitScaleValue =(obj:any)=> {
    const tempScale = 0.21914148330688477;
    var boxHelper = new THREE.BoxHelper(obj);
    boxHelper.geometry.computeBoundingBox();
    let box:any = boxHelper.geometry.boundingBox;
    let maxDiameter = Math.max((box.max.x - box.min.x), (box.max.y - box.min.y), (box.max.z - box.min.z));
    let scaleRate = maxDiameter/tempScale;
    scaleRate = getRealRate(scaleRate);
    let scale_calc = maxDiameter / (2 * Math.tan(camera.fov * Math.PI / 360));
    let scale = 1/4/scale_calc * scaleRate;// 手动修改调整，控制默认初始化的缩放比例系数
    return scale;
  }

  /**
     * 屏幕大小改变，重新渲染
     */
   const onWindowResize = ()=> {
    resizeListener();
    modelWidth = canvasRef.current.clientWidth;
    modelHeight = canvasRef.current.clientHeight;
    if(IsPC()){
      camera.aspect = 3/ 2.1;
    }else {
      camera.aspect = 3/ 4;
    }
    // camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( modelWidth, modelHeight );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    render();
  }

  const resizeListener = ()=>{
    // 定义设计图的尺寸 1920
    let designSize = 1920;
    // 获取 html 元素
    let html = document.documentElement;
    // 定义窗口的宽度
    let clientW = html.clientWidth;
    let sizeNum = 15;
    modelWrapRef.current.style = "flex-direction: row; justify-content: flex-start;align-items: center;";
    canvasRef.current.style = "width: 750px;height: 500px;";
    optPaneRef.current.style = "width: 500px;height: 500px; padding-top: 0; padding-left: 40px;";
    if(clientW <= 750){
      sizeNum = 50
      modelWrapRef.current.style = "flex-direction: column;align-items: flex-start;";
      canvasRef.current.style = "width: 80vw;height: 50vh;min-height: 400px;";
      optPaneRef.current.style = "width: 80vw;height: 50vh; padding-top: 20px; padding-left: 0;";
    }else if(clientW <= 900){
      sizeNum = 16
      // canvasRef.current.style = "width: 420px;height: 280px;";
      // optPaneRef.current.style = "width: 240px;height: 280px;";
      canvasRef.current.style = "width: 480px;height: 320px;";
      optPaneRef.current.style = "width: 300px;height: 320px;";
    }else if(clientW <= 1200){
      sizeNum = 16
      // canvasRef.current.style = "width: 480px;height: 320px;";
      // optPaneRef.current.style = "width: 300px;height: 320px;";
      canvasRef.current.style = "width: 540px;height: 360px;";
      optPaneRef.current.style = "width: 360px;height: 360px;";
    }else if(clientW <= 1440){
      sizeNum = 18
      // canvasRef.current.style = "width: 540px;height: 360px;";
      // optPaneRef.current.style = "width: 360px;height: 360px;";
      canvasRef.current.style = "width: 690px;height: 460px;";
      optPaneRef.current.style = "width: 360px;height: 460px;";
    }else if(clientW <= 1680){
      sizeNum = 18
      // canvasRef.current.style = "width: 600px;height: 400px;";
      // optPaneRef.current.style = "width: 420px;height: 400px;";
      canvasRef.current.style = "width: 690px;height: 460px;";
      optPaneRef.current.style = "width: 420px;height: 460px;";
    }else if(clientW <= 1920){
      sizeNum = 18
      canvasRef.current.style = "width: 690px;height: 460px;";
      optPaneRef.current.style = "width: 480px;height: 460px;";
    }
    // html 的fontsize 大小
    let htmlRem = clientW * sizeNum / designSize;
    html.style.fontSize = htmlRem + 'px';
  }

  /**
   * 执行渲染方法
   */
  const render = ()=> {
    renderer.render( scene, camera );
  }

  const frameArea = (sizeToFitOnScreen:any, boxSize:any, boxCenter:any, camera:any) =>{
    
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();
  
    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
  
    camera.updateProjectionMatrix();
  
    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  /**
   * 
   * @param Mesh 控制模型显隐
   */
  const showMesh = (Mesh:any) => {
    let obj:any= scene.getObjectByName(Mesh.name);
    obj.visible  = !obj.visible;
    let meshData_new = {...meshData};
    setMeshData(meshData_new);
    render();
  }

  /**
   * 滑块滚动条控制缩放
   */
  const handleChangeSlider = (value:any)=> {
    isMove = false;
    const size = value;
    setSliderSize(size);
    camera.fov = size;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  /**
   * 重置模型初始的位置
   */
  const handleResetModel = ()=> {
    const size = 30;
    setSliderSize(size);

    if(controls){
      controls.reset();
    }
    if(camera){
      camera.fov = size;
      camera.updateProjectionMatrix();
    }

    const groupArr = scene.children.filter((one:any) => one.type =='Group');
    const axesArr = scene.children.filter((one:any) => one.type =='AxesHelper');
    groupArr.forEach((g:any)=>{
      // g.rotation.x = 0
      // g.rotation.y = 0
      const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
              0,
              0,
              0,
              'XYZ'
          ));
        g.quaternion.multiplyQuaternions(deltaRotationQuaternion, deltaRotationQuaternion);
    })
    axesArr.forEach((a:any)=>{
      // a.rotation.x = 0
      // a.rotation.y = 0
      const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
              0,
              0,
              0,
              'XYZ'
          ));
        a.quaternion.multiplyQuaternions(deltaRotationQuaternion, deltaRotationQuaternion);
    })

    render();
  }

   /**
   * 控制坐标轴显示隐藏
   */
    const handleShowAxias = ()=> {
      setShowAxes(!showAxes);
      let obj:any= scene.getObjectByName("axes");
      obj.visible  = !obj.visible;
      render();
    }

  /**
   * 设置透明度事件
   */
  const handleChangeOpacity = (mesh:any) => {
      let obj:any= scene.getObjectById(mesh.id);
      obj.material.transparent = true;
      obj.material.side = THREE.FrontSide
      let opacity = obj.material.opacity;
      if(opacity == 1){
        opacity = 0.75
      }else if(opacity == 0.75){
        opacity = 0.5
      }else if(opacity == 0.5){
        opacity = 0.25
      }else if(opacity == 0.25){
        opacity = 0
      }else if(opacity == 0){
        opacity = 1
      }
      if(mesh.name == '皮肤'){
        if(opacity == 1){
          obj.material.depthTest = true;
        }else {
          obj.material.depthTest = false;
        }
      }
      obj.material.opacity = opacity;
      let meshData_new = {...meshData};
      setMeshData(meshData_new);
      render();
  }

  /**
   * 解析计算模型颜色color：rgb
   */
  const parseMeshColor = (mesh:any) => {
    let color = mesh.material.color;
    let r = (color.r * 255).toFixed(3);
    let g = (color.g * 255).toFixed(3);
    let b = (color.b * 255).toFixed(3);
    let color_rgb = `rgb(${r},${g},${b})`;
    return color_rgb;
  }
  

  return (
    <div className={styles.container}>
      <div className={styles.top_nav}>
        <div className={styles.nav_left}>
          <img src={Logo} alt=""/>
          <span>HoloLicyo</span>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.main_wrap}>
          <div className={styles.scene_title}>
            <span className={styles.goback} onClick={()=>{props.history.go(-1)}}>
              {formatIcon('iconleftarrow')}
            </span>
            <span className={styles.model_name}>
              模型
            </span>
          </div>
          <div className={styles.model_wrapper} ref={modelWrapRef}>
            <Spin tip={progressText} spinning={isLoading}>
              <div id="view-wrapper" ref={canvasRef} className={styles.view_model} onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}>
                {IsPC()?<div className={styles.blank_pane} onClick={(e:any)=>e.preventDefault()}>
                </div>:null}
                <div className={styles.flow_pane}>
                  <div className={styles.reset} onClick={()=>{handleResetModel()}}>
                    {formatIcon('iconreset')}
                  </div>
                  <div className={`${styles.point_xray} ${!showAxes?styles.hideAxes:''}`} onClick={()=>{handleShowAxias()}}>
                    {formatIcon('iconzuobiaozhou')}
                  </div>
                  <div className={styles.progress_bar}>
                    <Slider value={sliderSize} min={1} max={100}  tooltipVisible={false} vertical={true} reverse={true}
                      onChange={handleChangeSlider}/>
                  </div>
                  <div className={styles.big_mirror}>
                    {formatIcon('iconfangdajing')}
                  </div>
                </div>
              </div>
            </Spin>
            <div className={styles.opt_pane} ref={optPaneRef}>
              <ul>
                {meshData && meshData.children.length > 0?
                    meshData.children.map((Mesh:any) => (
                        <li key={Mesh.name}>
                          <div className={styles.left_wrapper}>
                            <span className={`${styles.eyes_icon} ${!Mesh.visible?styles.isClose:''}`} onClick={()=>showMesh(Mesh)}>
                              {Mesh.visible?formatIcon('iconyanjingdakai'):
                              formatIcon('iconyanjingguanbi1')}
                            </span>
                            <span className={styles.mesh_name}>
                              {Mesh.name}
                            </span>
                          </div>
                          <div className={styles.mesh_color}>
                            <div className={styles.block} style={{background:parseMeshColor(Mesh)}}>
                            </div>
                            <div className={styles.mesh_opacity} onClick={()=>handleChangeOpacity(Mesh)}>
                              {/* <span className={styles.icon}>
                                {formatIcon('icontoumingdu')}
                              </span> */}
                              <span className={styles.opacity}>
                                {`${Mesh.material.opacity * 100}%`}
                              </span>
                            </div>
                          </div>
                        </li>
                    ))
                  :null  
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Model3D;