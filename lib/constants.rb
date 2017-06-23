module Constants
  NETWORK_COMPONENTS = ['Pc', 'Router', 'Switch', 'Laptop', 'Server', 'Printer', 'Firewall', 'Internet', 'NormalPackage',
                        'AttackPackage', 'TcpSimple','TcpAttack',
                        'UdpSimple','UdpAttack','IcmpSimple','IcmpAttack']
  COMPONENTS_IMAGES = { Laptop: '/assets/laptop.png',
                        Router: '/assets/router.png',
                        Pc: '/assets/pc.png',
                        Switch: '/assets/hub.png',
                        Server: '/assets/server.png',
                        Printer: '/assets/printer.png',
                        NormalPackage: '/assets/package.png',
                        AttackPackage: '/assets/attack.png',
                        Firewall: '/assets/firewall.png',
                        Internet: '/assets/internet.png',
                        TcpSimple: '/assets/package-tcp.png',
                        TcpAttack: '/assets/attack-tcp.png',
                        UdpSimple: '/assets/package-udp.png',
                        UdpAttack: '/assets/attack-udp.png',
                        IcmpSimple: '/assets/package-icmp.png',
                        IcmpAttack: '/assets/attack-icmp.png' }
  NORMAL_PACKAGES = ['NormalPackage', 'TcpSimple', 'UdpSimple', 'IcmpSimple']
  ATTACK_PACKAGES = ['AttackPackage', 'TcpAttack', 'UdpAttack', 'IcmpAttack']
  TIMES_IN_SECOND = {second: 1, minute: 60, hour: 3600, day: 86400}.with_indifferent_access
  IP_TOTAL_BITS = 32
  IP_BITS_PER_NUMBER = 8
end
