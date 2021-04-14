'use strict';
(
    () => {

        let yOffset = 0;
        let prevScrollHeight = 0;
        let currentScene = 0; // 현재 활성화된 section
        
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
                    
                    messageA_opacity: [0, 1],

                }

            },
            {   // 1
                type: 'normal',
                heightNum: 5,
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-1')
                },
                values: {
                    
                    messageA_opacity: [0, 1],

                }

            },
            {   // 2
                type: 'sticky',
                heightNum: 5,
                scrollHeight: 0,                
                objs: {
                    container: document.querySelector('#scroll-section-2')
                }
                
            },
            {   // 3
                type: 'sticky',
                heightNum: 5,
                scrollHeight: 0,                
                objs: {
                    container: document.querySelector('#scroll-section-3')
                }
                
            }
        ];

        window.addEventListener('resize', setLayout);
        window.addEventListener('load', setLayout); //resource load 후 콜백 수행
        setLayout();
        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            onScrollLoop();
            // setStickyElemLayout();


        });
        

        function setStickyElemLayout() {
                const rectHeight = sceneInfo[currentScene].objs.messageA.getBoundingClientRect().height*(1/2);
                sceneInfo[currentScene].objs.messageA.style.top = '50vh';
                sceneInfo[currentScene].objs.messageA.style.transform = `translateY(-${rectHeight}px)`;
        }
        
        
        // 새로고침해도 sticky-elem들이 남아있게 하기 위해
        // 초기화 할 때 실행되는 함수
        function setLayout() {
            // console.log(yOffset);
            
            // 각 스크롤 섹션의 height 세팅
            for (let i = 0 ; i < sceneInfo.length; i ++) {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
                sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
            }
            
            yOffset = window.pageYOffset;
            // console.log(yOffset);

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
            if (yOffset === 0) {
                document.body.removeAttribute('id');
                return;
            }
            prevScrollHeight = 0;
            scrollHeightSum();
            // yOFfset이 prevScrollHeight보다 크거나 같아지면 currentScene ++
            if (yOffset >= prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
                currentScene++;
            }
            if (yOffset < prevScrollHeight) {
                if (currentScene === 0) return;
                currentScene--;
            }
            // console.log(currentScene);
            document.body.setAttribute('id', `show-scene-${currentScene}`);
            playAnimation();
        }

        function playAnimation() {
            const objs = sceneInfo[currentScene].objs;
            const values = sceneInfo[currentScene].values;
            const currentYOffset = yOffset - prevScrollHeight; // 여기가 음수 되는 원인

            switch (currentScene) {
                case 0:
                    let messageA_opacity_in = calcValues(values.messageA_opacity, currentYOffset);
                    let messageA_opacity_out;
                    objs.messageA.style.opacity = messageA_opacity_in;
                    break;
                case 1:
                    calcValues(values.messageA_opacity, currentYOffset);

                    break;
                case 2:
                    break;
                case 3:
                    break;
            }
        }

        // 범위 계산 함수
        function calcValues(values, currentYOffset) {
            let rv;
            // 0~1의 값
            let scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight;
            rv = (scrollRatio * (values[1] - values[0])) + values[0];
            console.log(currentScene, currentYOffset, sceneInfo[currentScene].scrollHeight);
            return rv;
        }

        // 지난 섹션의 ScrollHeight 합
        function scrollHeightSum() {
            for (let i = 0 ; i < currentScene ; i ++ ) {
                prevScrollHeight += sceneInfo[i].scrollHeight;
            }
            return prevScrollHeight;
        }

    }
)();