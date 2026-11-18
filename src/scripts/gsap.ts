/**
 * Single GSAP setup shared by all scripts: plugins + the brand ease,
 * which is the same curve as CSS --ease: cubic-bezier(0.16, 1, 0.3, 1).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, SplitText, CustomEase, Flip);
CustomEase.create('brand', '0.16, 1, 0.3, 1');
gsap.defaults({ ease: 'brand', duration: 0.9 });

export { gsap, ScrollTrigger, MorphSVGPlugin, SplitText, Flip };

// Dev/QA builds only (absent from normal production builds): lets QA tooling fast-forward animations.
if (import.meta.env.DEV || import.meta.env.PUBLIC_QA_HOOKS === 'true') Object.assign(window, { gsap, ScrollTrigger });
