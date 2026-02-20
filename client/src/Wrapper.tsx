interface WrapperProps {
  children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
  return (
    <div className=" bg-linear-to-r from-gray-700 via-black to-gray-700 text-white w-screen h-screen absolute top-0 left-0 flex items-center justify-center">
      {children}
    </div>
  );
}
