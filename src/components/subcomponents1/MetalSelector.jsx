import useAppState from '../../store/useState';
import useStyle from '../../store/useStyle';

const MetalSelector = () => {
    const { referenceMetal, setReferenceMetal } = useAppState();
    const { metals } = useStyle();

    return (
        <div className="d-flex align-items-center gap-2">
            <label className="text-secondary small mb-0 d-none d-sm-block">Metal:</label>
            <select
                className="form-select form-select-sm bg-dark text-light border-secondary"
                style={{ width: 'auto', minWidth: '100px' }}
                value={referenceMetal}
                onChange={(e) => setReferenceMetal(e.target.value)}
            >
                {metals.map((metal) => (
                    <option key={metal.name} value={metal.name}>
                        {metal.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MetalSelector;
