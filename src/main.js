'use strict';
(
    () => {
        let yOffset = 0; // window.pageYOffset
        let prevScrollHeight = 0; // 현재 보고있는 섹션 이전 섹션들의 scrollHeight 총합
        let currentSection = 0; // 현재 활성화된 section number
        let isEnterNewSection = false; // 새로운 섹션에 진입한 순간 true

        let delayedYOffset = 0;
        let rafId;
        let rafState;
        let acc = 0.1;

        const CANVAS_WIDTH = 1920;
        const CANVAS_HEIGHT = 1080;

        const loadingPage = document.querySelector('.loading-page');

        const navigation = document.querySelector('.local-nav');
        const navLinks = document.querySelector('.local-nav-links');
        const topBtn = document.querySelector('.footer i');

        const sectionInfo = [
            {
                // section 0
                type: 'sticky',
                heightNum: 6, // 브라우저 높이의 5배로 scrollHeight 세팅
                scrollHeight: 0,
                objs: {
                    container: document.querySelector('#scroll-section-0'),
                    messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                    messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                    messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                    messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                    canvas: document.querySelector('.video-canvas'),
                    context: document.querySelector('.video-canvas').getContext('2d'),
                    videoImages: []
                },
                values: {
                    videoImageCount: 484,
                    imageSequence: [0, 485],
                    // [첫범위, 끝범위, {첫좌표ratio, 끝좌표ratio}]
                    canvas_opacity_in: [0, 1, {start: 0.1, end : 0.2}],
                    canvas_opacity_out: [1, 0, {start: 0.85, end : 0.99}],
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
                    content: document.querySelector('#scroll-section-1 .description'),
                    previewImgs: document.querySelectorAll('.img-preview'),
                    modal: document.querySelector('#img-modal'),
                    modalContent : document.querySelector('.modal-content'),
                    modalImgsPath: [
                        './img/ski-modal.jpg',
                        './img/art-modal.jpg',
                        './img/animal-modal.jpg',
                    ],
                    modalCloseBtn: document.querySelector('#img-modal .close')
                },
                values: {
                }
            },
            {   // section 2
                type: 'sticky',
                heightNum: 4,
                scrollHeight: 0,                
                objs: {
                    container: document.querySelector('#scroll-section-2'),
                    canvas: document.querySelector('.image-blend-canvas'),
                    canvasCaption: document.querySelector('.canvas-caption'),
                    context: document.querySelector('.image-blend-canvas').getContext('2d'),
                    imgsPath : [
                        './img/blend-image-1.jpg'
                    ],
                    images: []
                },
                values: {
                    rect1X: [0, 0, { start: 0, end: 0}],
                    rect2X: [0, 0, { start: 0, end: 0}],
                    blendHeight: [ 0, 0, { start: 0, end: 0 } ],
                    canvas_scale: [ 0, 0, { start: 0, end: 0 } ],
                    canvasCaption_opacity: [ 0, 1, { start: 0, end: 0 } ],
                    canvasCaption_translateY: [ 50, 0, { start: 0.5, end: 0.9 } ],
                    rectStartY: 0
                }
            }
        ];
        
        setLayout();
        setCanvasImages();

        window.addEventListener('resize', setLayout);
        window.addEventListener('orientationchange', setLayout);

        window.addEventListener('load', () => {
            document.querySelector('.container').removeChild(loadingPage);
            setLayout();
        });

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            onScrollLoop();
            if (!rafState) {
                rafId = requestAnimationFrame(loop);
                rafState = true;
            }
        });

        // navigation link 클릭시 섹션 이동
        navLinks.addEventListener('click', (e) => {
            const link = e.target.dataset.link;
            if (link === undefined) {
                return;
            }
            
            if (link === '2') {
                sectionInfo[link].objs.container.scrollIntoView({block: "end"});
            } else {
                sectionInfo[link].objs.container.scrollIntoView();
            }
        })

        // 모달 팝업 이벤트 리스너
        sectionInfo[1].objs.previewImgs.forEach(element => {
            element.addEventListener('click', e => {
                const targetNum = e.target.dataset.modal;
                sectionInfo[1].objs.modal.style.display = 'block';
                sectionInfo[1].objs.modalContent.src = sectionInfo[1].objs.modalImgsPath[targetNum];
            });
        });

        sectionInfo[1].objs.modalCloseBtn.addEventListener('click', () => {
            sectionInfo[1].objs.modal.style.display = 'none';
        });

        topBtn.addEventListener('click', () => {
            sectionInfo[0].objs.container.scrollIntoView();
        })

        // 새로고침해도 sticky-elem들이 남아있게 하기 위해
        // 초기화 할 때 실행되는 함수
        function setLayout() {  
            // 1. 각 scroll section의 height 지정
            for (let i = 0 ; i < sectionInfo.length; i ++) {
                if (sectionInfo[i].type === 'sticky') {
                    sectionInfo[i].scrollHeight = sectionInfo[i].heightNum * window.innerHeight;
                    sectionInfo[i].objs.container.style.height = `${sectionInfo[i].scrollHeight}px`;
                } else {// normal type
                    sectionInfo[i].scrollHeight = sectionInfo[i].objs.container.offsetHeight;
                }
            }
            // 2. totalScrollHeight과 현재 스크롤 위치를 비교해서 currentSection setting
            yOffset = window.pageYOffset;
            let totalScrollHeight = 0;
            for (let i = 0; i < sectionInfo.length; i++) {
                totalScrollHeight += sectionInfo[i].scrollHeight;
                if (totalScrollHeight >= yOffset) {
                    currentSection = i;
                    break;
                }
                document.body.setAttribute('id', `show-scene-${currentSection}`);
            }
            // 3. canvas scale, 위치 조정
            const heightRatio = window.innerHeight / CANVAS_HEIGHT;
            sectionInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
        }

        // canvas로 그릴 이미지 객체 미리 생성하기
        function setCanvasImages() {
            // section 0 imgs
            let imgElem;
            for (let i = 1; i <= sectionInfo[0].values.videoImageCount ; i ++) {
                imgElem = new Image();
                imgElem.src = `./video/001/ballet (${i}).jpg`
                sectionInfo[0].objs.videoImages.push(imgElem);
            }

            // section 2 imgs
            let imgElem2 = new Image();
            imgElem2.src = sectionInfo[2].objs.imgsPath[0];
            sectionInfo[2].objs.images.push(imgElem2);
        }

        function onScrollLoop() {
            isEnterNewSection = false;
            prevScrollHeight = 0;
            prevScrollHeightSum();

            // yOffset과 prevScrollHeight 비교해서 currentSection 판별 (스크롤 내릴 때)
            if (yOffset >= prevScrollHeight + sectionInfo[currentSection].scrollHeight) {
                isEnterNewSection = true;
                currentSection++;
            } else if (yOffset < prevScrollHeight) { // 스크롤 올릴 때
                if (currentSection === 0) return;
                isEnterNewSection = true;
                currentSection--;
            }
            document.body.setAttribute('id', `show-scene-${currentSection}`);
            
            // currentSection 바뀌는 순간 예상치 못한 음수 값이 출력되므로 그 찰나에만 함수를 return하게 해줌
            if (isEnterNewSection) return;
            playAnimation();
        }

        // 이전 섹션의 ScrollHeight 합
        function prevScrollHeightSum() {
            for (let i = 0 ; i < currentSection ; i ++ ) {
                prevScrollHeight += sectionInfo[i].scrollHeight;
            }
            return prevScrollHeight;
        }

        function loop() {
            // 자연스러운 감속을 위한 계산식
            delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

            if (!isEnterNewSection) {
                const currentYOffset = delayedYOffset - prevScrollHeight;
                const values = sectionInfo[currentSection].values;
                const objs = sectionInfo[currentSection].objs;

                if (currentSection === 0) {
                    let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                    if (objs.videoImages[sequence]) {
                        objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                    }
                }
            }
            rafId = requestAnimationFrame(loop);

            if (Math.abs(yOffset - delayedYOffset) < 1) {
                cancelAnimationFrame(rafId);
                rafState = false;
            }
        }
        
        
        const scrollHeight = sectionInfo[currentSection].scrollHeight;
        // 한 section 내부에서의 재생될 애니메이션에 관한 함수
        function playAnimation() {
            const objs = sectionInfo[currentSection].objs;
            const values = sectionInfo[currentSection].values;
            const currentYOffset = yOffset - prevScrollHeight; // veiwPort에서 current section 까지의 거리 (px)
            const scrollRatio = currentYOffset / scrollHeight; // current Section에서 얼만큼 스크롤 했는지 비율
            
            switch (currentSection) {
                case 0:
                    // 이미지를 캔버스에 그리기
                    
                    if (scrollRatio < 0.1) {
                        navigation.classList.remove('invisible');
                    }

                    if (scrollRatio >= 0.165) {
                        navigation.classList.add('invisible');
                    }

                    if (scrollRatio <= 0.22) {
                        // in
                        objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
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
                        objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
                    }

                    if (scrollRatio > 0.9) navigation.classList.remove('invisible');
                    break;

                case 1:
                    if (scrollRatio > 0.9) {
                        const objs = sectionInfo[2].objs;
                        const values = sectionInfo[2].values;
                        const widthRatio = window.innerWidth / objs.canvas.width;
                        const heightRatio = window.innerHeight / objs.canvas.height;
                        let canvasScaleRatio;
    
                        // 비율에 따라 캔버스의 크기 조절이 달라지게
                        if (widthRatio <= heightRatio) {
                            // 캔버스보다 브라우저 창이 홀쭉한 경우 높이에 맞춤
                            canvasScaleRatio = heightRatio;
                        } else {
                            // 캔버스보다 브라우저 창이 납작한 경우 너비에 맞춤
                            canvasScaleRatio = widthRatio;
                        }
                        
                        objs.context.fillStyle = 'white';
                        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                        objs.context.drawImage(objs.images[0], 0, 0);
    
                        const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
    
                        // canvas 양 옆에 들어갈 박스 두 개
                        const whiteRectWidth = recalculatedInnerWidth * 0.15;
                        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
                        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
    
                        values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
                        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;
    
                        // 좌우 흰색 박스 그리기
                        objs.context.fillRect(
                        calcValues(values.rect1X, currentYOffset),
                        0,
                        whiteRectWidth,
                        objs.canvas.height);
    
                        objs.context.fillRect(
                        calcValues(values.rect2X, currentYOffset),
                        0,
                        whiteRectWidth,
                        objs.canvas.height);
    
                        //캔버스가 브라우저 상단에 닿지 않았다면
                        if (scrollRatio < values.rect1X[2].end) {
                            objs.canvas.classList.remove('sticky');
                            objs.canvas.style.opacity = 1;
                        } else { //상단에 닿은 이후
                            objs.canvas.classList.add('sticky');
                            objs.canvas.style.top = `-${(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;
                            objs.canvas.style.opacity = 1 - (scrollRatio * 2);
                        }
    
                    }
                    break;
                    
                case 2:
                    const widthRatio = window.innerWidth / objs.canvas.width;
                    const heightRatio = window.innerHeight / objs.canvas.height;
                    let canvasScaleRatio;

                    // 비율에 따라 캔버스의 크기 조절이 달라지게
                    if (widthRatio <= heightRatio) {
                        // 캔버스보다 브라우저 창이 홀쭉한 경우 높이에 맞춤
                        canvasScaleRatio = heightRatio;
                    } else {
                        // 캔버스보다 브라우저 창이 납작한 경우 너비에 맞춤
                        canvasScaleRatio = widthRatio;
                    }
                    
                    objs.context.fillStyle = 'white';
                    objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                    objs.context.drawImage(objs.images[0], 0, 0);

                    const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
                    
                    if (!values.rectStartY) {
                        values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
                        values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight;
                        values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight;
                        
                        values.rect1X[2].end = values.rectStartY / scrollHeight;
                        values.rect2X[2].end = values.rectStartY / scrollHeight;
                    }

                    // canvas 양 옆에 들어갈 박스 두 개
                    const whiteRectWidth = recalculatedInnerWidth * 0.15;
                    values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
                    values.rect1X[1] = values.rect1X[0] - whiteRectWidth;

                    values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
                    values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

                    // 좌우 흰색 박스 그리기
                    objs.context.fillRect(
					calcValues(values.rect1X, currentYOffset),
                    0,
                    whiteRectWidth,
					objs.canvas.height);

                    objs.context.fillRect(
                    calcValues(values.rect2X, currentYOffset),
                    0,
                    whiteRectWidth,
                    objs.canvas.height);

                    //캔버스가 브라우저 상단에 닿지 않았다면
                    if (scrollRatio < values.rect1X[2].end) {
                        objs.canvas.classList.remove('sticky');
                        objs.canvas.style.opacity = 1;
                    } else { //상단에 닿은 이후
                        objs.canvas.classList.add('sticky');
                        objs.canvas.style.top = `-${(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;
                        objs.canvas.style.opacity = 1 - (scrollRatio * 2);
                    }
                    
                    break;
            }
        }
        
        // 범위 계산 함수
        function calcValues(values, currentYOffset) {
            let rv;
            const scrollRatio = currentYOffset / sectionInfo[currentSection].scrollHeight;
            
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