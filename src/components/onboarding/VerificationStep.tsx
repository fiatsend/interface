interface VerificationStepProps {
    phoneNumber: string;
    onVerify: (code: string) => void;
    onResend: () => void;
  }
  
  export const VerificationStep: React.FC<VerificationStepProps> = ({
    phoneNumber,
    onVerify,
    onResend,
  }) => {
    const [code, setCode] = useState(['', '', '', '']);
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Verify Your Number</h1>
        <p className="text-gray-600">
          Enter the 4-digit code sent to your phone.
        </p>
  
        <div className="flex gap-4 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center border rounded-lg text-xl"
              value={digit}
              onChange={(e) => {
                const newCode = [...code];
                newCode[index] = e.target.value;
                setCode(newCode);
                if (e.target.value && index < 3) {
                  const nextInput = document.querySelector(
                    `input[name=code-${index + 1}]`
                  ) as HTMLInputElement;
                  if (nextInput) nextInput.focus();
                }
              }}
              name={`code-${index}`}
            />
          ))}
                </div>

<button
  className="text-purple-600 text-sm"
  onClick={onResend}
>
  Didn't receive code? Resend
</button>

<button
  className="w-full bg-purple-600 text-white py-3 rounded-lg"
  onClick={() => onVerify(code.join(''))}
>
  Verify
</button>
</div>
);
};