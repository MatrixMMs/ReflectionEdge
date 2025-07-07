import React from 'react';

interface LegalDisclaimerProps {
  variant?: 'compact' | 'full' | 'modal';
  onClose?: () => void;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ 
  variant = 'compact', 
  onClose 
}) => {
  const compactDisclaimer = (
    <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg border border-gray-700" style={{ background: 'var(--background-secondary)' }}>
      <p className="font-semibold text-gray-300 mb-1">⚠️ Important Disclaimers</p>
      <p>
        Reflection Edge is for educational and analytical purposes only. 
        Not financial advice. Past performance doesn't guarantee future results. 
        All trading decisions are your responsibility.
      </p>
    </div>
  );

  const fullDisclaimer = (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-4xl mx-auto" style={{ background: 'var(--background-secondary)' }}>
      <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
        ⚠️ Important Legal Disclaimers
      </h2>
      
      <div className="space-y-6 text-sm text-gray-300">
        {/* Financial Advice Disclaimer */}
        <section>
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Not Financial Advice
          </h3>
          <p className="mb-2">
            Reflection Edge is a trading analysis and educational tool designed to help you analyze your trading performance. 
            This software does not provide financial advice, investment recommendations, or trading signals.
          </p>
          <p>
            <strong>Important:</strong> All trading decisions, including what to buy, sell, or hold, are your own responsibility. 
            You should consult with qualified financial advisors, accountants, and legal professionals before making any investment decisions.
          </p>
        </section>

        {/* Educational Purpose */}
        <section>
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Educational Purpose Only
          </h3>
          <p>
            This software is intended for educational purposes to help you understand your trading patterns, 
            analyze your performance, and improve your trading discipline. It is not a substitute for 
            professional financial advice or proper risk management.
          </p>
        </section>

        {/* Past Performance */}
        <section>
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Past Performance Disclaimer
          </h3>
          <p>
            Past performance does not guarantee future results. Historical data and analysis provided by 
            this software may not be indicative of future performance. Trading involves substantial risk 
            of loss and is not suitable for all investors.
          </p>
        </section>

        {/* Data Accuracy */}
        <section>
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Data Accuracy and Reliability
          </h3>
          <p>
            While we strive for accuracy, the data, calculations, and analysis provided by this software 
            may contain errors or inaccuracies. Market data may be delayed or incomplete. You should 
            verify all information independently before making trading decisions.
          </p>
        </section>

        {/* Risk Warning */}
        <section>
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Risk Warning
          </h3>
          <p>
            Trading financial instruments involves substantial risk of loss. You can lose some or all of 
            your invested capital. The high degree of leverage can work against you as well as for you. 
            Before deciding to trade, you should carefully consider your investment objectives, level of 
            experience, and risk appetite.
          </p>
        </section>

        {/* No Guarantee */}
        <section>
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            No Guarantees
          </h3>
          <p>
            There are no guarantees that you will achieve any particular results from using this software. 
            Trading success depends on many factors including market conditions, timing, and individual 
            trading decisions. The software is provided "as is" without any warranties.
          </p>
        </section>

        {/* Regulatory Compliance */}
        <section>
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            Regulatory Compliance
          </h3>
          <p>
            This software is not registered with any regulatory authority and does not provide regulated 
            financial services. Users are responsible for ensuring their use of this software complies 
            with applicable laws and regulations in their jurisdiction.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Limitation of Liability
          </h3>
          <p>
            In no event shall the developers or operators of Reflection Edge be liable for any direct, 
            indirect, incidental, special, or consequential damages arising from the use of this software, 
            including but not limited to trading losses, data loss, or any other financial losses.
          </p>
        </section>

        {/* User Responsibility */}
        <section>
          <h3 className="text-lg font-semibold text-green-300 mb-2">
            Your Responsibility
          </h3>
          <p>
            By using this software, you acknowledge that:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>You understand the risks involved in trading</li>
            <li>You are responsible for all trading decisions</li>
            <li>You will not rely solely on this software for investment decisions</li>
            <li>You will consult with qualified professionals when needed</li>
            <li>You understand that past performance is not indicative of future results</li>
          </ul>
        </section>
      </div>

      {onClose && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      )}
    </div>
  );

  const modalDisclaimer = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--background-secondary)' }}>
        {fullDisclaimer}
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return compactDisclaimer;
    case 'modal':
      return modalDisclaimer;
    case 'full':
    default:
      return fullDisclaimer;
  }
};

// Footer disclaimer component for persistent display
export const FooterDisclaimer: React.FC = () => (
  <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-700 bg-gray-900" style={{ background: 'var(--background-secondary)' }}>
    <p>
      Reflection Edge is for educational purposes only. Not financial advice. 
      Past performance doesn't guarantee future results. 
      <a href="#" className="text-blue-400 hover:text-blue-300 ml-1">
        View full disclaimers
      </a>
    </p>
  </div>
);

// Terms of Service component
export const TermsOfService: React.FC = () => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-4xl mx-auto" style={{ background: 'var(--background-secondary)' }}>
    <h2 className="text-2xl font-bold text-gray-200 mb-4">Terms of Service</h2>
    
    <div className="space-y-4 text-sm text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">1. Acceptance of Terms</h3>
        <p>
          By accessing and using Reflection Edge, you accept and agree to be bound by the terms and 
          provision of this agreement.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">2. Use License</h3>
        <p>
          Permission is granted to temporarily use Reflection Edge for personal, non-commercial 
          transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">3. Disclaimer</h3>
        <p>
          The materials on Reflection Edge are provided on an 'as is' basis. Reflection Edge makes no 
          warranties, expressed or implied, and hereby disclaims and negates all other warranties 
          including without limitation, implied warranties or conditions of merchantability, fitness 
          for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">4. Limitations</h3>
        <p>
          In no event shall Reflection Edge or its suppliers be liable for any damages (including, 
          without limitation, damages for loss of data or profit, or due to business interruption) 
          arising out of the use or inability to use the materials on Reflection Edge.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">5. Privacy Policy</h3>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your 
          use of the service, to understand our practices.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">6. Modifications</h3>
        <p>
          Reflection Edge may revise these terms of service at any time without notice. By using this 
          service you are agreeing to be bound by the then current version of these Terms of Service.
        </p>
      </section>
    </div>
  </div>
); 