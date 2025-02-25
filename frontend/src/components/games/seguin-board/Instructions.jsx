
const Instructions = ({ text, isChild = false }) => {
  return (
    <div className={`instructions-container mb-6 ${isChild ? 'child-friendly' : ''}`}>
      <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="icon text-[#F09000]">
            {isChild ? (
              <i className="fa fa-puzzle-piece text-2xl"></i>
            ) : (
              <i className="fa fa-info-circle text-xl"></i>
            )}
          </div>
          
          <h2 className={`font-bold mb-2 ${isChild ? 'text-2xl text-[#F09000]' : 'text-xl text-[#66220B]'}`}>
            {isChild ? 'Let\'s Play!' : 'Instructions'}
          </h2>
        </div>
        
        <p className={`${isChild ? 'text-lg text-gray-700' : 'text-gray-600'} pl-6`}>
          {text}
        </p>
        
        {isChild && (
          <div className="mt-4 flex justify-center">
            <div className="animated-hint flex items-center text-[#F09000]">
              <i className="fa fa-hand-pointer-o mr-2"></i>
              <span>Drag the shapes to match the outlines!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;