import { Link } from 'react-router-dom';
import { AdoptInfo, PetType, AdoptionStatus } from '../../types/adopt';

interface AdoptCardProps {
  adopt: AdoptInfo;
}

export const AdoptCard = ({ adopt }: AdoptCardProps) => {
  const getPetTypeLabel = (petType: PetType) => {
    const labels = {
      [PetType.CAT]: '猫咪',
      [PetType.DOG]: '狗狗',
      [PetType.BIRD]: '鸟类',
      [PetType.FISH]: '鱼类',
      [PetType.OTHER]: '其他',
    };
    return labels[petType] || '未知';
  };

  const getStatusLabel = (status: AdoptionStatus) => {
    const labels = {
      [AdoptionStatus.PENDING]: '待领养',
      [AdoptionStatus.ADOPTED]: '已领养',
      [AdoptionStatus.CANCELLED]: '已取消',
    };
    return labels[status] || '未知';
  };

  const getStatusColor = (status: AdoptionStatus) => {
    const colors = {
      [AdoptionStatus.PENDING]: 'bg-secondary-soft text-secondary-dark',
      [AdoptionStatus.ADOPTED]: 'bg-primary-soft text-primary-dark',
      [AdoptionStatus.CANCELLED]: 'bg-error/10 text-error-dark',
    };
    return colors[status] || 'bg-muted text-brown';
  };

  return (
    <Link
      to={`/adopts/${adopt.id}`}
      className="block bg-white rounded-md shadow-card overflow-hidden"
    >
      <div className="flex">
        {adopt.photos && adopt.photos.length > 0 && (
          <img
            src={adopt.photos[0]}
            alt={adopt.petName}
            className="w-24 h-24 object-cover"
          />
        )}
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-brown">{adopt.petName}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(adopt.status)}`}>
                {getStatusLabel(adopt.status)}
              </span>
            </div>
            <span className="text-xs text-brown-muted">{adopt.applicationCount} 人申请</span>
          </div>
          <div className="flex items-center gap-2 mb-2 text-sm text-brown-muted">
            <span>{getPetTypeLabel(adopt.petType)}</span>
            {adopt.petAge && <span>· {adopt.petAge}</span>}
            {adopt.petGender === 1 && <span>· 公</span>}
            {adopt.petGender === 2 && <span>· 母</span>}
          </div>
          <div className="text-sm text-brown-muted truncate">{adopt.description}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-brown-light">
            <span className="icon-location"></span>
            <span>{adopt.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};