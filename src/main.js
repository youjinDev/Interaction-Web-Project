'use strict';
(
    () => {
        let yOffset = 0; // window.scrollY
        let prevScrollHeight = 0; // 현재 보고있는 섹션 이전 섹션들의 scroll height 총합
        let currentSection = 0; // 현재 활성화된 section number
        let isEnterNewSection = false; // 새로운 섹션에 진입한 순간 true
        
        const SectionInfo = [
            {   // 각 기기가 가진 높이를 고려하기 위해 heightNum이라는 가중치를 주기로 함
                // section 0
                type: 'sticky',
                heightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-0'),
                    messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                    messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                    messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                    messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                    canvas: document.querySelector('#video-canvas-0'),
                    context: document.querySelector('#video-canvas-0').getContext('2d'),
                    videoImages: []
                },
                values: {
                    videoImageCount: 300,
                    imageSequence: [0, 299],
                    // [첫범위, 끝범위, {첫좌표범위, 끝좌표범위}]
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
            {   // section 1
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
            {   // section 2
                type: 'sticky',
                heightNum: 5,
                scrollHeight: 0,                
                objs: {
                    container: document.querySelector('#scroll-section-3'),
                    canvasCaption: document.querySelector('.canvas-caption')
                }
                
            }
        ];
        

        window.addEventListener('resize', setLayout); //창 resize시 setLayout 수행
        window.addEventListener('load', setLayout); //resource load 후 콜백 setLayout 수행
        setLayout();
        setCanvasImages();
        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            onScrollLoop();
        });
        const scrollHeight = SectionInfo[currentSection].scrollHeight;

        // 새로고침해도 sticky-elem들이 남아있게 하기 위해
        // 초기화 할 때 실행되는 함수
        function setLayout() {
            // 각 스크롤 섹션의 height 세팅
            for (let i = 0 ; i < SectionInfo.length; i ++) {
                if (SectionInfo[i].type === 'sticky') {
                    SectionInfo[i].scrollHeight = SectionInfo[i].heightNum * window.innerHeight;
                    SectionInfo[i].objs.container.style.height = `${SectionInfo[i].scrollHeight}px`;
                } else {// normal type
                    SectionInfo[i].scrollHeight = SectionInfo[i].objs.container.offsetHeight;
                }
            }
            yOffset = window.pageYOffset;
            // totalScrollHeight과 현재 스크롤 위치를 비교해서 currentSection setting
            let totalScrollHeight = 0;
            for (let i = 0; i < SectionInfo.length; i++) {
                totalScrollHeight += SectionInfo[i].scrollHeight;
                if (totalScrollHeight >= yOffset) {
                    currentSection = i;
                    break;
                }
                document.body.setAttribute('id', `show-scene-${currentSection}`);
            }
            //canvas scale 조정
            const heightRatio = window.innerHeight / 1080;
            SectionInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
        }

        function onScrollLoop() {
            isEnterNewSection = false;
            if (yOffset === 0) {
                document.body.removeAttribute('id');
                return;
            }
            prevScrollHeight = 0;
            calcPrevScrollHeightSum();

            // yOFfset이 prevScrollHeight보다 크거나 같아지면 currentSection ++
            if (yOffset >= prevScrollHeight + SectionInfo[currentSection].scrollHeight) {
                isEnterNewSection = true;
                currentSection++;
            }
            if (yOffset < prevScrollHeight) {
                if (currentSection === 0) return;
                isEnterNewSection = true;
                currentSection--;
            }
            document.body.setAttribute('id', `show-scene-${currentSection}`);
            if (isEnterNewSection) return; // currentSection 바뀌는 순간 예상치 못한 음수 값이 출력되므로 그 찰나에만 함수를 return하게 해줌
            playAnimation();
        }

        // 이전 섹션의 ScrollHeight 합
        function calcPrevScrollHeightSum() {
            for (let i = 0 ; i < currentSection ; i ++ ) {
                prevScrollHeight += SectionInfo[i].scrollHeight;
            }
            return prevScrollHeight;
        }
        
        // 한 section 내부에서의 재생될 애니메이션에 관한 함수
        function playAnimation() {
            console.log('playAni fucntion');
            const objs = SectionInfo[currentSection].objs;
            const values = SectionInfo[currentSection].values;
            const currentYOffset = yOffset - prevScrollHeight; // 여기가 음수 되는 원인
            const scrollRatio = currentYOffset / scrollHeight; // current Section에서 얼만큼 스크롤 했는지 비율
            console.log(scrollRatio);
            switch (currentSection) {
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
                    // 이미지를 캔버스에 그리기
                    // SectionInfo[0].objs.context.drawImage();
                    let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                    objs.context.drawImage(objs.videoImages[sequence], 0, 0);
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
            const scrollRatio = currentYOffset / SectionInfo[currentSection].scrollHeight;
            
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

        // videoImages 배열에 이미지 엘리먼트 넣기
        function setCanvasImages() {
            let imgElem;
            for (let i = 0; i < SectionInfo[0].values.videoImageCount ; i ++) {
                imgElem = new Image();
                imgElem.src = `./video/001/IMG_${6726 + i}.jpg`
                SectionInfo[0].objs.videoImages.push(imgElem);
            }
        }
    }

)();