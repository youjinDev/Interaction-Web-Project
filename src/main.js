'use strict';
(
    () => {
        let yOffset = 0; // window.scrollY
        let prevScrollHeight = 0; // 현재 보고있는 섹션의 이전 섹션들의 scroll height 총합
        let currentScene = 0; // 현재 활성화된 section number
        let isEnterNewScene = false; // 새로운 섹션에 진입한 순간 true
        
        const sceneInfo = [
            {   // 각 기기가 가진 높이를 고려
                // 0
                type: 'sticky',
                heightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-0'),
                    messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                    messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                    messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                    messageD: document.querySelector('#scroll-section-0 .main-message.d')
                },
                values: {
                    messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
                    messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
                    messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
                    messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
                    messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
                    messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
                    messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
                    messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
                    messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
                    messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
                    messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
                    messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                    messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
                    messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
                    messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
                    messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
                }
            },
            {   // 1
                type: 'normal',
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-1'),
                    content: document.querySelector('#scroll-section-1 .description')
                }
            },
            // {   // 2
            //     type: 'sticky',
            //     heightNum: 5,
            //     scrollHeight: 0,                
            //     objs: {
            //         container: document.querySelector('#scroll-section-2'),
            //         messageA: document.querySelector('#scroll-section-2 .a'),
            //         messageB: document.querySelector('#scroll-section-2 .b'),
            //         messageC: document.querySelector('#scroll-section-2 .c'),
            //         pinB: document.querySelector('#scroll-section-2 .b .pin'),
            //         pinC: document.querySelector('#scroll-section-2 .c .pin')
            //     },
            //     values: {
            //         messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
            //         messageB_translateY_in: [30, 0, { start: 0.6, end: 0.65 }],
            //         messageC_translateY_in: [30, 0, { start: 0.87, end: 0.92 }],
            //         messageA_opacity_in: [0, 1, { start: 0.25, end: 0.3 }],
            //         messageB_opacity_in: [0, 1, { start: 0.6, end: 0.65 }],
            //         messageC_opacity_in: [0, 1, { start: 0.87, end: 0.92 }],
            //         messageA_translateY_out: [0, -20, { start: 0.4, end: 0.45 }],
            //         messageB_translateY_out: [0, -20, { start: 0.68, end: 0.73 }],
            //         messageC_translateY_out: [0, -20, { start: 0.95, end: 1 }],
            //         messageA_opacity_out: [1, 0, { start: 0.4, end: 0.45 }],
            //         messageB_opacity_out: [1, 0, { start: 0.68, end: 0.73 }],
            //         messageC_opacity_out: [1, 0, { start: 0.95, end: 1 }],
            //         pinB_scaleY: [0.5, 1, { start: 0.6, end: 0.65 }],
            //         pinC_scaleY: [0.5, 1, { start: 0.87, end: 0.92 }]
            //     }
                
            // },
            {   // 2
                type: 'sticky',
                heightNum: 5,
                scrollHeight: 0,                
                objs: {
                    container: document.querySelector('#scroll-section-3'),
                    canvasCaption: document.querySelector('.canvas-caption')
                }
                
            }
        ];

        window.addEventListener('resize', setLayout);
        window.addEventListener('load', setLayout); //resource load 후 콜백 수행
        setLayout();

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            onScrollLoop();
        });

    
        
        const scrollHeight = sceneInfo[currentScene].scrollHeight;

        // 새로고침해도 sticky-elem들이 남아있게 하기 위해
        // 초기화 할 때 실행되는 함수
        function setLayout() {
            
            
            // 각 스크롤 섹션의 height 세팅
            for (let i = 0 ; i < sceneInfo.length; i ++) {
                if (sceneInfo[i].type === 'sticky') {
                    sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
                    sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
                } else {
                    sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
                }
            }
            yOffset = window.pageYOffset;
            // totalScrollHeight과 현재 스크롤 위치를 비교해서 currentScene setting
            let totalScrollHeight = 0;
            for (let i = 0; i < sceneInfo.length; i++) {
                totalScrollHeight += sceneInfo[i].scrollHeight;
                if (totalScrollHeight >= yOffset) {
                    currentScene = i;
                    break;
                }
                document.body.setAttribute('id', `show-scene-${currentScene}`);
            }
        }

        function onScrollLoop() {
            isEnterNewScene = false;
            if (yOffset === 0) {
                document.body.removeAttribute('id');
                return;
            }
            prevScrollHeight = 0;
            calcPrevScrollHeightSum();

            // yOFfset이 prevScrollHeight보다 크거나 같아지면 currentScene ++
            if (yOffset >= prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
                isEnterNewScene = true;
                currentScene++;
            }
            if (yOffset < prevScrollHeight) {
                if (currentScene === 0) return;
                isEnterNewScene = true;
                currentScene--;
            }
            document.body.setAttribute('id', `show-scene-${currentScene}`);
            if (isEnterNewScene) return; // currentScene이 바뀌는 순간 예상치 못한 음수 값이 출력되므로 그 찰나에만 함수를 return하게 해줌
            playAnimation();
        }

        // 이전 섹션의 ScrollHeight 합
        function calcPrevScrollHeightSum() {
            for (let i = 0 ; i < currentScene ; i ++ ) {
                prevScrollHeight += sceneInfo[i].scrollHeight;
            }
            return prevScrollHeight;
        }
        

        // 한 section 내부에서의 재생될 애니메이션에 관한 함수
        function playAnimation() {
            const objs = sceneInfo[currentScene].objs;
            const values = sceneInfo[currentScene].values;
            const currentYOffset = yOffset - prevScrollHeight; // 여기가 음수 되는 원인
            const scrollRatio = currentYOffset / scrollHeight; // current Scene에서 얼만큼 스크롤 했는지 비율

            switch (currentScene) {
                case 0:
                    if (scrollRatio <= 0.22) {
                        // in
                        objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                        objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                    } else {
                        // out
                        objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                        objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                    }
        
                    if (scrollRatio <= 0.42) {
                        // in
                        objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                        objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                    } else {
                        // out
                        objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                        objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                    }
        
                    if (scrollRatio <= 0.62) {
                        // in
                        objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                        objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                    } else {
                        // out
                        objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                        objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                    }
        
                    if (scrollRatio <= 0.82) {
                        // in
                        objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
                        objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
                    } else {
                        // out
                        objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
                        objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
                    }
                    break;
                case 2:
                    // if (scrollRatio <= 0.32) {
                    //     // in
                    //     objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    //     objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                    // } else {
                    //     // out
                    //     objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    //     objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                    // }
        
                    // if (scrollRatio <= 0.67) {
                    //     // in
                    //     objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                    //     objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    //     objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                    // } else {
                    //     // out
                    //     objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                    //     objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    //     objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                    // }
        
                    // if (scrollRatio <= 0.93) {
                    //     // in
                    //     objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                    //     objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    //     objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                    // } else {
                    //     // out
                    //     objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                    //     objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    //     objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                    // }
                    break;
                case 3:
                    break;
            }
        }
        
        
        // 범위 계산 함수
        function calcValues(values, currentYOffset) {
            let rv;
            const scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight;
            
            if (values.length === 3) {
                // start~end 사이 애니메이션 실행
                const partScrollStart = values[2].start * scrollHeight; // px값
                const partScrollEnd = values[2].end * scrollHeight;
                const partScrollHeight = partScrollEnd - partScrollStart;
                if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
                    rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
                } else if (currentYOffset < partScrollStart) {
                    rv = values[0];
                } else if (currentYOffset > partScrollEnd) {
                    rv = values[1];
                }
            } else {
                rv = (scrollRatio * (values[1] - values[0])) + values[0];
            }
            return rv;
        }
    }
)();