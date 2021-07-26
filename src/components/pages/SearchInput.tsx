import React, { useEffect, useState ,useRef } from 'react';
import {Input,Button,message as Message} from "antd";

import styles from './SearchInput.module.scss';

const SearchInput = (props: any) => {
  const accessIdRef:any = useRef();

  useEffect(() => {
    // resizeListener();
    // window.addEventListener('resize', resizeListener);

    return ()=>{
      // window.removeEventListener('resize', resizeListener);
    }
  }, [])

  const resizeListener = ()=>{
    // 定义设计图的尺寸 1920
    let designSize = 1920;
    // 获取 html 元素
    let html = document.documentElement;
    // 定义窗口的宽度
    let clientW = html.clientWidth;
    let sizeNum = 16;
    if(clientW <= 768){
      sizeNum = 16
    }else if(clientW <= 1400){
      sizeNum = 16
    }else if(clientW <= 1600){
      sizeNum = 16
    }
    // html 的fontsize 大小
    let htmlRem = clientW * sizeNum / designSize;
    html.style.fontSize = htmlRem + 'px';
  }

  const handleSearch = () => {
    const val = accessIdRef.current.state.value;
    if(val){
      props.history.push({
        pathname: '/model',
        state: {accessId:val},
      });
     
    }else {
      Message.warn('请输入模型id');
    }
    
  }
  const handleKeyUp = () => {
    const e:any = window.event;
    if (e.keyCode == 13){
      const val = accessIdRef.current.state.value;
      if(val){
        props.history.push({
          pathname: '/model',
          state: {accessId:val},
        });
      
      }else {
        Message.warn('请输入模型id');
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.input_wrapper}>
        <Input
              placeholder="请输入模型id"
              className={styles.input_ele}
              allowClear
              ref={accessIdRef}
              onKeyUp={()=>handleKeyUp()}
          />
           <Button
                type="primary"
                className={styles.btn}
                onClick={()=>handleSearch()}
            >
                查看模型
            </Button>
      </div>
    </div>
  );
}

export default SearchInput;