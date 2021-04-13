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
                    container: document.querySelector('#scroll-section-0')
                }

            },
            {   // 1
                type: 'normal',
                heightNum: 5,
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-1')
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
        });
        





        // 새로고침해도 sticky-elem들이 남아있게 하기 위해
        // 초기화 할 때 실행되는 함수
        function setLayout() {
            console.log(yOffset);
            
            // 각 스크롤 섹션의 height 세팅
            for (let i = 0 ; i < sceneInfo.length; i ++) {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
                sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
            }
            
            yOffset = window.pageYOffset;
            console.log(yOffset);

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
            console.log(currentScene);
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }

        function scrollHeightSum() {
            for (let i = 0 ; i < currentScene ; i ++ ) {
                prevScrollHeight += sceneInfo[i].scrollHeight;
            }
            return prevScrollHeight;
        }

    }
)();