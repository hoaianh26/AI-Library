const PageTransition = ({ children, isVisible, direction = 'fade' }) => {
  const getTransitionClasses = () => {
    const baseClasses = "transition-all duration-500 ease-out";
    
    const transitions = {
      slideLeft: ` ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`,
      slideRight: ` ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`,
      slideUp: ` ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`,
      slideDown: ` ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`,
      scale: ` ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`,
      fade: ` ${isVisible ? 'opacity-100' : 'opacity-0'}`,
    };

    return baseClasses + (transitions[direction] || transitions.fade);
  };

  return (
    <div className={getTransitionClasses()}>
      {children}
    </div>
  );
};

export default PageTransition;