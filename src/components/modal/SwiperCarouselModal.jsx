import { useRef, useEffect, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { register } from "swiper/element/bundle";
import { useLocaleContext } from "app/contexts/locale/context";

register();

export default function SwiperCarouselModal({ isOpen, onClose, images = [], showOrderOnTop }) {
  const { direction } = useLocaleContext();
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Reset active index whenever modal opens
    setActiveIndex(0);

    let mounted = true;

    const params = {
      navigation: true,
      pagination: { clickable: true },
      on: {
        slideChange: function () {
          setActiveIndex(this.activeIndex);
        },
      },
    };

    const waitForRef = (timeout = 2000) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          if (!mounted) return reject(new Error("unmounted"));
          if (carouselRef.current) return resolve(carouselRef.current);
          if (Date.now() - start > timeout) return reject(new Error("timeout"));
          requestAnimationFrame(check);
        };
        check();
      });

    waitForRef()
      .then((el) => {
        Object.assign(el, params);
        setTimeout(() => {
          try {
            el.initialize && el.initialize();
            // ⭐ Reset swiper to first slide whenever modal opens
            el.slideTo && el.slideTo(0, 0); // no animation
          } catch (err) {
            console.error("Swiper initialize error:", err);
          }
        }, 50);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isOpen, images]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">

                <div className="flex justify-end mb-2">
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {showOrderOnTop && images.length > 0 && (
                  <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">
                    Order: {images[activeIndex]?.order}
                  </h2>
                )}

                {images.length === 0 ? (
                  <p className="text-gray-500">No images available.</p>
                ) : (
                  <swiper-container
                    key={`swiper-${images.length}-${isOpen ? 1 : 0}`}
                    ref={carouselRef}
                    init="false"
                    slides-per-view="1"
                    dir={direction}
                    space-between="16"
                    style={{ "--swiper-navigation-size": "28px" }}
                  >
                    {images.map((img, idx) => (
                      <swiper-slide key={img.id || idx}>
                        <img
                          alt={`slide-${idx}`}
                          src={img.url || img.image}
                          loading="lazy"
                          className="w-full h-[400px] object-contain rounded-lg"
                        />
                      </swiper-slide>
                    ))}
                  </swiper-container>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
