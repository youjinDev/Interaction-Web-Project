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
                    messageA_opacity_in: [0, 1, {start : 0.1, end : 0.2}],
                    messageA_opacity_out: [1, 0, {start : 0.25, end : 0.3}],
                    messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
                    messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }]
                
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

    
        
        const scrollHeight = sceneInfo[currentScene].scrollHeight;

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
                    let messageA_opacity_in = calcValues(values.messageA_opacity_in, currentYOffset);
                    let messageA_opacity_out = calcValues(values.messageA_opacity_out, currentYOffset);
                    let messageA_translateY_in = calcValues(values.messageA_translateY_in, currentYOffset);
                    let messageA_translateY_out = calcValues(values.messageA_translateY_out, currentYOffset);

                    if(scrollRatio <= 0.22) {
                        // in
                        objs.messageA.style.opacity = messageA_opacity_in;
                        objs.messageA.style.transform = `translateY(${messageA_translateY_in}%)`;
                    } else {
                        // out
                        objs.messageA.style.opacity = messageA_opacity_out;
                        objs.messageA.style.transform = `translateY(${messageA_translateY_out}%)`;
                    }
                    break;
                case 1:

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