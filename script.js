      const model = document.querySelector("#model");
      const camera = document.querySelector("#camera");
      const annotations = [
        document.getElementById("annotation-1"),
        document.getElementById("annotation-2"),
        document.getElementById("annotation-3"),
        document.getElementById("annotation-4"),
     ];
      const infoBox = document.getElementById("info-box");

      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      let scale = 0.3;

     // Teks untuk setiap anotasi
        const annotationTexts = [
            "Informasi tentang Filosofi.",
            "Informasi tentang Masalah Pembangunan.",
            "Informasi tentang Pendanaan.",
            "Informasi tentang Kontroversi Tugu Makalangan Unpad."
        ];
      // Update model size and position
      function updateModelSize() {
         const screenWidth = window.innerWidth;
         const screenHeight = window.innerHeight;

         // Menentukan ukuran model berdasarkan ukuran layar
         const scaleX = screenWidth / 800; 
         const scaleY = screenHeight / 800; 
         const adjustedScale = Math.min(scaleX, scaleY) * scale;

         model.setAttribute("scale", `${adjustedScale} ${adjustedScale} ${adjustedScale}`);

         // Posisi model agar tetap di tengah layar
         model.setAttribute("position", "0 -1 -5");

         // Menentukan ukuran anotasi berdasarkan ukuran layar
         const annotationSize = Math.max(10, Math.min(20, screenWidth / 50));
         annotations.forEach(annotation => {
            annotation.style.width = `${annotationSize}px`;
            annotation.style.height = `${annotationSize}px`;
         });
      }

      function updateAnnotationPosition() {
        const positions = [
            new THREE.Vector3(1, 1, -2), // Annotation 1
            new THREE.Vector3(4, 2, -0.5), // Annotation 2
            new THREE.Vector3(2, 5, -2), // Annotation 3
            new THREE.Vector3(4, 7, -1), // Annotation 4
         ];

        positions.forEach((position, index) => {
            const annotation = annotations[index];

            position.applyMatrix4(model.object3D.matrixWorld);
            position.project(model.sceneEl.camera);

            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(position.y * 0.5 - 0.5) * window.innerHeight;

            annotation.style.left = `${x}px`;
            annotation.style.top = `${y}px`;
            annotation.style.display = "block";
        });
         requestAnimationFrame(updateAnnotationPosition);
      }

      // Zoom in/out based on scroll or pinch
      function handleZoom(event) {
         if (event.deltaY) {
            // Mouse scroll
            const zoomFactor = 0.05;
            scale += event.deltaY > 0 ? -zoomFactor : zoomFactor;
            scale = Math.max(0.1, Math.min(1.5, scale));
            updateModelSize();
         }
      }

      let lastTouchDistance = 0;
      window.addEventListener("wheel", handleZoom);

      // Function to handle touch-based zoom (pinch gesture)
      function handleTouchZoom(event) {
         if (event.touches.length === 2) {
            const touchDistance = Math.hypot(
               event.touches[0].pageX - event.touches[1].pageX,
               event.touches[0].pageY - event.touches[1].pageY
            );
            if (lastTouchDistance) {
               scale += (touchDistance - lastTouchDistance) * 0.001;
               scale = Math.max(0.1, Math.min(1.5, scale));
               updateModelSize();
            }
            lastTouchDistance = touchDistance;
         }
      }

      function resetTouchDistance() {
         lastTouchDistance = 0;
      }

      window.addEventListener("touchmove", handleTouchZoom);
      window.addEventListener("touchend", resetTouchDistance);

      // Handle annotation clicks
      annotations.forEach((annotation, index) => {
        annotation.addEventListener("click", () => {
          infoBox.style.display = "block";
          // Tempatkan info box di sebelah kanan annotation
          const offsetX = 20; // Jarak horizontal dari annotation
          const offsetY = 0; // Sesuaikan jarak vertikal sesuai kebutuhan
      
          infoBox.style.left = `${parseInt(annotation.style.left) + annotation.offsetWidth + offsetX}px`;
          infoBox.style.top = `${parseInt(annotation.style.top) + offsetY}px`;
      
          infoBox.innerHTML = annotationTexts[index] + `<br><a href="information.html?annotation=${index + 1}">Selengkapnya</a>`;

          infoBox.style.height = '30px'; // Tinggi otomatis berdasarkan konten
          infoBox.style.overflow = 'auto'; // Tambahkan scroll jika teks terlalu panjang
        });
      });
      
      // Handle info box click (hide it)
      infoBox.addEventListener("click", () => {
         infoBox.style.display = "none";
      });

      // Event listener when the model is loaded
      model.addEventListener("model-loaded", () => {
         updateModelSize();
         updateAnnotationPosition();
      });

      // Event listener on window resize
      window.addEventListener("resize", updateModelSize);

      // Dragging functionality
      function startDrag(event) {
         if (event.touches && event.touches.length > 1) return; // Ignore if pinch gesture
         isDragging = true;
         lastX = event.clientX || event.touches[0].clientX;
         lastY = event.clientY || event.touches[0].clientY;
      }

      function dragMove(event) {
         if (isDragging) {
            const deltaX = (event.clientX || event.touches[0].clientX) - lastX;
            const deltaY = (event.clientY || event.touches[0].clientY) - lastY;
            const currentRotation = model.getAttribute("rotation");

            model.setAttribute("rotation", {
               x: currentRotation.x + deltaY * 0.2,
               y: currentRotation.y + deltaX * 0.2,
               z: currentRotation.z
            });
            
            lastX = event.clientX || event.touches[0].clientX;
            lastY = event.clientY || event.touches[0].clientY;
         }
      }

      function endDrag() {
         isDragging = false;
      }

      // Mouse and touch events for dragging
      window.addEventListener("mousedown", startDrag);
      window.addEventListener("mousemove", dragMove);
      window.addEventListener("mouseup", endDrag);

      window.addEventListener("touchstart", startDrag);
      window.addEventListener("touchmove", dragMove);
      window.addEventListener("touchend", endDrag);

      // Initial setup
      updateModelSize();