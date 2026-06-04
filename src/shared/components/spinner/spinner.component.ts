// shared/components/spinner/spinner.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner-overlay">
      <div class="spinner-container">
        <div class="quran-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          #0f1e16 0%,
          #183528 40%,
          #224737 75%,
          #14241c 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      }
      .spinner-container {
        text-align: center;
      }
      .quran-spinner {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 20px;
      }
      .spinner-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid transparent;
        animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      }
      .spinner-ring:nth-child(1) {
        border-top-color: #ffd700;
        animation-delay: 0s;
      }
      .spinner-ring:nth-child(2) {
        border-right-color: #ffa500;
        animation-delay: 0.3s;
        width: 85%;
        height: 85%;
        top: 7.5%;
        left: 7.5%;
      }
      .spinner-ring:nth-child(3) {
        border-bottom-color: #ff6b35;
        animation-delay: 0.6s;
        width: 70%;
        height: 70%;
        top: 15%;
        left: 15%;
      }
      .spinner-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 28px;
        font-weight: bold;
        color: #ffd700;
        font-family: 'Amiri', serif;
        animation: pulse 1.5s ease-in-out infinite;
      }
      .spinner-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        font-weight: 500;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes pulse {
        0%,
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.1);
          opacity: 0.8;
        }
      }
    `,
  ],
})
export class SpinnerComponent {}
